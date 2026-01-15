import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import dayjs from 'dayjs'
import { Prisma, User } from '../../generated/prisma'
import { MailService } from '../../providers/mail/mail.service'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { IMAGES } from '../../utils'
import { BcryptService } from '../auth/bcrypt.service'
import { NotificationService } from '../notification/notification.service'
import {
	AssignUserPermissionDto,
	PermissionAction,
} from './dto/assign-user-permission.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserQueryDto } from './dto/user-query.dto'
import { UserResponseDto } from './dto/user-response.dto'

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name)
	constructor(
		private readonly prismaService: PrismaService,
		private readonly bcryptService: BcryptService,
		private readonly mailService: MailService,
		private readonly notificationService: NotificationService
	) {}

	async create(dto: CreateUserDto, sendInviteEmail: boolean) {
		// 1. Check if user exists (including soft-deleted ones)
		const existingUser = await this.prismaService.user.findFirst({
			where: { email: dto.email },
		})

		// If user is active (deletedAt is null), throw conflict
		if (existingUser && !existingUser.deletedAt) {
			throw new ConflictException('Email already exists')
		}

		// Prepare shared data
		const hashedPassword = await this.bcryptService.hash(dto.password)
		const username = await this.generateUsernameFromEmail(dto.email)
		const avatar = this.generateAvatar(dto.displayName)

		let roleId = dto.roleId
		if (!roleId) {
			const staffRole = await this.prismaService.role.findUnique({
				where: { code: 'staff' },
			})
			roleId = staffRole?.id
		}

		const userData = {
			...dto,
			password: hashedPassword,
			username,
			avatar,
			roleId,
			isActive: true,
			deletedAt: null, // Critical: Reset the delete flag
		}

		// 2. Transaction for Create or Update (Restore)
		const user = await this.prismaService.$transaction(async (tx) => {
			let userResult

			if (existingUser && existingUser.deletedAt) {
				// RESTORE LOGIC
				userResult = await tx.user.update({
					where: { id: existingUser.id },
					data: userData,
					include: { role: true },
				})
			} else {
				// NORMAL CREATE LOGIC
				// Using create instead of createManyAndReturn for single objects is cleaner
				userResult = await tx.user.create({
					data: userData,
					include: { role: true },
				})
			}
			return userResult
		})

		try {
			await this.notificationService.send({
				userId: user.id,
				title: existingUser
					? 'Account Restored'
					: 'Welcome to CADSQUAD',
				content: 'Your account has been successfully set up.',
				type: 'SUCCESS',
				imageUrl: IMAGES.NOTIFICATION_DEFAULT_IMAGE,
				redirectUrl: '/profile',
			})
		} catch (sideEffectError) {
			// Log the error but don't fail the User creation
			this.logger.error('Send user notification error:', sideEffectError)
		}

		// 3. Send Email
		try {
			if (sendInviteEmail) {
				await this.mailService.sendUserInvitation(
					dto.email,
					dto.displayName,
					dto.password
				)
			}
		} catch (error) {
			this.logger.error('Email failed to send:', error)
		}

		return plainToInstance(UserResponseDto, user, {
			excludeExtraneousValues: true,
		}) as unknown as User
	}

	async updatePassword(
		userId: string,
		dto: UpdatePasswordDto
	): Promise<{ message: string }> {
		const { oldPassword, newPassword, newConfirmPassword } = dto

		// check user tồn tại
		const user = await this.prismaService.user.findUnique({
			where: { id: userId, isActive: true },
		})
		if (!user) {
			throw new NotFoundException('User not found')
		}

		// check old password
		const isMatch = await this.bcryptService.compare(
			oldPassword,
			user.password
		)
		if (!isMatch) {
			throw new BadRequestException('Old password is incorrect')
		}

		// check new === confirm
		if (newPassword !== newConfirmPassword) {
			throw new BadRequestException(
				'New password and confirm password do not match'
			)
		}

		// check new khác old
		const isSameAsOld = await this.bcryptService.compare(
			newPassword,
			user.password
		)
		if (isSameAsOld) {
			throw new BadRequestException(
				'New password must be different from old password'
			)
		}

		// hash và update
		const hashedPassword = await this.bcryptService.hash(newPassword)
		await this.prismaService.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		})

		return { message: 'Password updated successfully' }
	}

	async assignRole(userId: string, roleId: string) {
		const existingUser = await this.prismaService.user.findUnique({
			where: {
				id: userId,
				isActive: true,
			},
		})
		if (!existingUser) {
			throw new NotFoundException(`User with id:::${userId} not found`)
		}
		try {
			const updated = await this.prismaService.user.update({
				where: { id: userId },
				data: { roleId },
				select: {
					username: true,
					role: {
						include: { permissions: true },
					},
				},
			})
			return { role: updated.role, username: updated.username }
		} catch (error) {
			this.logger.error('Updated user role failed', error.stack)
		}
	}
	async findAll(query: UserQueryDto): Promise<{
		users: UserResponseDto[]
		total: number
		totalPages: number
		currentPage: number
	}> {
		const { search, departmentId, role, page, limit } = query

		// 1. Build the dynamic filter
		const where: Prisma.UserWhereInput = {
			deletedAt: null,
			...(search && {
				OR: [
					{ displayName: { contains: search, mode: 'insensitive' } },
					{ email: { contains: search, mode: 'insensitive' } },
					{ username: { contains: search, mode: 'insensitive' } },
				],
			}),
			...(departmentId && { departmentId }),
			...(role && { role: { code: role } }),
		}

		// 2. Determine if we should paginate
		// If either page or limit is missing, we fetch everything
		const isPaging = page !== undefined && limit !== undefined
		const skip = isPaging ? (Number(page) - 1) * Number(limit) : undefined
		const take = isPaging ? Number(limit) : undefined

		// 3. Execute queries
		const [users, total] = await this.prismaService.$transaction([
			this.prismaService.user.findMany({
				where,
				include: {
					department: true,
					jobTitle: true,
					role: true,
				},
				orderBy: { createdAt: 'desc' },
				skip, // If undefined, Prisma ignores it
				take, // If undefined, Prisma ignores it
			}),
			this.prismaService.user.count({ where }),
		])

		return {
			users: plainToInstance(UserResponseDto, users, {
				excludeExtraneousValues: true,
			}),
			total,
			// If not paging, currentPage is 1 and totalPages is 1
			currentPage: isPaging ? Number(page) : 1,
			totalPages: isPaging ? Math.ceil(total / Number(limit)) : 1,
		}
	}

	async resetPassword(userId: string, data: ResetPasswordDto) {
		const hashedPassword = await this.bcryptService.hash(data.newPassword)
		const user = await this.prismaService.user.update({
			where: { id: userId, deletedAt: null },
			data: { password: hashedPassword },
		})
		return { username: user.username }
	}

	async findById(userId: string): Promise<User | null> {
		try {
			const userData = await this.prismaService.user.findUnique({
				where: { id: userId, deletedAt: null },
			})
			const userRes = plainToInstance(UserResponseDto, userData, {
				excludeExtraneousValues: true,
			})
			return userRes as unknown as User
		} catch (error) {
			throw new NotFoundException('User not found')
		}
	}
	/**
	 * Find a user by their unique ID.
	 *
	 * @param {number} username - The ID of the user to retrieve.
	 * @returns {Promise<User | null>} The user object retrieved from the database, or null if not found.
	 *
	 * @throws {NotFoundException} If no user is found with the provided ID.
	 */
	async findByUsername(username: string): Promise<User | null> {
		try {
			const userData = await this.prismaService.user.findUnique({
				where: { username: username, deletedAt: null },
				include: {
					department: true,
					jobTitle: true,
					role: {
						include: {
							permissions: true,
						},
					},
				},
			})
			const userRes = plainToInstance(UserResponseDto, userData, {
				excludeExtraneousValues: true,
			})
			return userRes as unknown as User
		} catch (error) {
			throw new NotFoundException('User not found')
		}
	}

	async manageUserPermission(userId: string, dto: AssignUserPermissionDto) {
		// 1. Check if User exists
		const user = await this.prismaService.user.findUnique({
			where: { id: userId, deletedAt: null },
		})
		if (!user) throw new NotFoundException('User not found')

		// 2. Check if Permission exists
		const permission = await this.prismaService.permission.findUnique({
			where: { id: dto.permissionId },
		})
		if (!permission) throw new NotFoundException('Permission not found')

		// 3. Handle Logic based on Action
		if (dto.action === PermissionAction.INHERIT) {
			// INHERIT: Remove the override record so it falls back to Role
			try {
				await this.prismaService.userPermission.delete({
					where: {
						userId_permissionId: {
							userId,
							permissionId: dto.permissionId,
						},
					},
				})
				return {
					message:
						'Permission override removed. Now inheriting from Role.',
				}
			} catch (error) {
				// Record might not exist, which is fine
				return {
					message: 'Permission was already inheriting from Role.',
				}
			}
		} else {
			// GRANT or DENY: Upsert the record
			const isDenied = dto.action === PermissionAction.DENY

			const result = await this.prismaService.userPermission.upsert({
				where: {
					userId_permissionId: {
						userId,
						permissionId: dto.permissionId,
					},
				},
				update: {
					isDenied, // Update existing status
				},
				create: {
					userId,
					permissionId: dto.permissionId,
					isDenied,
				},
			})

			return {
				message: isDenied
					? 'Permission explicitly DENIED.'
					: 'Permission explicitly GRANTED.',
				data: result,
			}
		}
	}

	async update(
		username: string,
		data: UpdateUserDto
	): Promise<{ id: string; username: string }> {
		const user = await this.prismaService.user.update({
			where: { username, deletedAt: null },
			data,
		})
		if (!user) {
			throw new NotFoundException('User not found!')
		}
		return { id: user.id, username: user.username }
	}

	async softDelete(id: string) {
		// 1. Fetch user and count active job assignments in one go if possible
		const existingUser = await this.prismaService.user.findUnique({
			where: { id },
			include: {
				jobAssignments: {
					where: {
						job: {
							status: {
								systemType: { notIn: ['TERMINATED'] },
							},
						},
					},
				},
			},
		})

		if (!existingUser) {
			throw new NotFoundException('User not found')
		}

		// 2. Check if the user has ongoing jobs
		if (existingUser.jobAssignments.length > 0) {
			throw new BadRequestException(
				`Cannot delete user: They still have ${existingUser.jobAssignments.length} active job assignments.`
			)
		}

		// 3. Perform soft delete
		await this.prismaService.user.update({
			where: { id },
			data: {
				isActive: false, // Keep username, but "burn" or reset everything else
				deletedAt: new Date(),
				username: `${existingUser.username}_deleted-${Date.now()}`,
				password: 'DELETED_USER_ACCOUNT', // Scramble the password
				departmentId: null,
				jobTitleId: null,
				roleId: null,
			},
		})

		return {
			username: existingUser.username,
			message: 'User soft-deleted successfully',
		}
	}

	async toggleUserStatus(
		modifierId: string,
		userId: string,
		forceStatus?: string
	) {
		// 1. Kiểm tra user tồn tại
		const user = await this.prismaService.user.findUnique({
			where: { id: userId, deletedAt: null },
			select: {
				id: true,
				isActive: true,
				role: true,
				displayName: true,
				email: true,
			},
		})

		if (!user) throw new NotFoundException('User not found')

		// 2. Bảo mật: Không cho phép Admin tự vô hiệu hóa chính mình
		if (userId === modifierId) {
			throw new ForbiddenException(
				'You cannot deactivate your own account'
			)
		}

		// 3. Xác định trạng thái mới
		// Nếu forceStatus là '0' -> false, '1' -> true. Nếu undefined -> đảo ngược (!user.isActive)
		let newStatus: boolean
		if (forceStatus !== undefined) {
			newStatus = forceStatus === '1'
		} else {
			newStatus = !user.isActive
		}

		try {
			if (newStatus) {
				await this.mailService.sendAccountStatusUpdate({
					displayName: user.displayName,
					email: user.email,
					isActive: newStatus,
				})
			}
		} catch (error) {
			this.logger.error(error)
			throw new InternalServerErrorException('Send email error')
		}

		const resultUpdated = await this.prismaService.user.update({
			where: { id: userId },
			data: { isActive: !user.isActive },
		})
		// 3. Cập nhật trạng thái
		return {
			isActive: resultUpdated.isActive,
			username: resultUpdated.username,
		}
	}

	private async existingEmail(email: string) {
		return await this.prismaService.user.findUnique({
			where: {
				email,
			},
		})
	}

	async isUsernameTaken(username: string): Promise<boolean> {
		const count = await this.prismaService.user.count({
			where: {
				username: {
					equals: username,
					mode: 'insensitive', // Không phân biệt hoa thường (VD: 'John' và 'john' là một)
				},
			},
		})

		return count > 0
	}

	async userPermissions(userId: string): Promise<string[]> {
		const permissions = await this.prismaService.user.findUnique({
			where: { id: userId },
			select: { role: { include: { permissions: true } } },
		})
		const mapPermissions =
			permissions?.role?.permissions.map((it) => it.entityAction) ?? []
		if (mapPermissions.length === 0) {
			throw new NotFoundException('User not have any permissions')
		}
		return mapPermissions
	}

	async search(query: string) {
		return this.prismaService.user.findMany({
			where: {
				OR: [
					{ displayName: { contains: query, mode: 'insensitive' } },
					{ email: { contains: query, mode: 'insensitive' } },
				],
				isActive: true, // Nếu chỉ muốn tìm nhân viên đang hoạt động
			},
			select: {
				id: true,
				displayName: true,
				username: true,
				email: true,
				avatar: true, // Nếu cần hiển thị ảnh
			},
			take: 20,
		})
	}

	async getUserSchedule(
		userId: string,
		month: number,
		year: number,
		day?: number
	) {
		// 1. Tạo object cơ sở để tránh lặp lại logic .year().month()
		const baseDate = dayjs('2026/01/14')

		let start: Date
		let end: Date

		if (day) {
			// Kiểm tra nếu day không hợp lệ cho tháng đó (VD: 31/02)
			const daysInMonth = baseDate.daysInMonth()
			const targetDay = day > daysInMonth ? daysInMonth : day

			const dateObj = baseDate.date(targetDay)
			start = dateObj.startOf('day').toDate()
			end = dateObj.endOf('day').toDate()
		} else {
			start = baseDate.startOf('month').toDate()
			end = baseDate.endOf('month').toDate()
		}

		const jobsSchedule = await this.prismaService.job.findMany({
			where: {
				dueAt: {
					gte: start,
					lte: end,
				},
				assignments: {
					some: {
						userId: userId,
					},
				},
				deletedAt: null, // Đảm bảo job chưa bị xóa
			},
			include: {
				status: {
					select: {
						displayName: true,
						hexColor: true,
						code: true,
					},
				},
				type: true,
			},
			orderBy: {
				dueAt: 'asc',
			},
		})

		return {
			jobsSchedule,
			meta: {
				start,
				end,
				type: day ? 'day' : 'month',
				total: jobsSchedule.length,
			},
		}
	}

	/**
	 * Input: ch.duong@cadsquad.vn -> Output: ch.duong
	 * Nếu ch.duong đã tồn tại -> Output: ch.duong.a1b2
	 */
	private async generateUsernameFromEmail(email: string): Promise<string> {
		// 1. Tách phần prefix từ email (Lấy phần trước dấu @)
		// Ví dụ: ch.duong@cadsquad.vn -> ch.duong
		const baseUsername = email.split('@')[0].toLowerCase()

		// 2. Kiểm tra sự tồn tại trong Database
		const existingUser = await this.prismaService.user.findUnique({
			where: { username: baseUsername },
			select: { id: true },
		})

		// 3. Nếu chưa tồn tại, dùng luôn baseUsername
		if (!existingUser) {
			return baseUsername
		}

		// 4. Nếu đã tồn tại, tạo hậu tố ngẫu nhiên (4 ký tự)
		// Kết quả: ch.duong.x8k2
		const shortId = Math.random().toString(36).substring(2, 6)
		const finalUsername = `${baseUsername}.${shortId}`

		return finalUsername
	}

	/**
	 * Tạo URL avatar từ tên hiển thị
	 * @param name Ví dụ: "Ho Thien My"
	 * @returns https://ui-avatars.com/api/?name=Ho+Thien+My&background=random
	 */
	private generateAvatar(name: string): string {
		// 1. Loại bỏ các khoảng trắng thừa
		const cleanName = name.trim()

		// 2. Thay thế khoảng trắng bằng dấu "+" để đúng định dạng URL query
		const formattedName = cleanName.replace(/\s+/g, '+')

		// 3. Trả về URL hoàn chỉnh
		return `https://ui-avatars.com/api/?name=${formattedName}&background=random&size=128`
	}
}
