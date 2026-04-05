import { SecurityLogStatus, User } from '@/generated/prisma'
import { UserResponseDto } from '@/modules/user/dto/user-response.dto'
import { UserSecurityService } from '@/modules/user/user-security.service'
import { MailService } from '@/providers/mail/mail.service'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { REDIS_CLIENT } from '@/providers/redis/redis.provider'
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import Redis from 'ioredis'
import { randomBytes } from 'node:crypto'
import { BcryptService } from './bcrypt.service'
import { LoginUserDto } from './dto/login-user.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { SessionService } from './session.service'
import { TokenService } from './token.service'

@Injectable()
export class AuthService {
	constructor(
		@Inject(REDIS_CLIENT) private readonly redis: Redis,
		private readonly prismaService: PrismaService,
		private readonly bcryptService: BcryptService,
		@Inject(forwardRef(() => TokenService))
		private readonly tokenService: TokenService,
		private readonly userSecurityService: UserSecurityService,
		private readonly sessionService: SessionService,
		private readonly mailService: MailService
	) { }

	async login(ip: string, userAgent: string, loginDto: LoginUserDto) {
		// 1. Check user existing
		const existingUser = await this.prismaService.user.findUnique({
			where: { email: loginDto.email },
		})
		if (!existingUser) {
			// Save User Security Log
			throw new UnauthorizedException('Incorrect email or password')
		}
		// 2. Compare inputPassword and databasePassword
		const isCertificate = await this.bcryptService.compare(
			loginDto.password,
			existingUser.password
		)
		if (!isCertificate) {
			await this.userSecurityService.createLog({
				userId: existingUser.id,
				event: 'Login Failed',
				status: SecurityLogStatus.FAILED,
				ipAddress: ip,
				userAgent,
			})
			throw new UnauthorizedException('Incorrect email or password')
		}

		// Save User Security Log
		await this.userSecurityService.createLog({
			userId: existingUser.id,
			event: 'Login Success',
			status: SecurityLogStatus.SUCCESS,
			ipAddress: ip,
			userAgent,
		})
		// 4. Return token
		try {
			const accessToken =
				await this.tokenService.getAccessToken(existingUser)

			// 3. Lưu Session vào Redis
			const sessionId = await this.sessionService.saveSession(
				existingUser.id,
				{
					userId: existingUser.id,
					accessToken: {
						expiresAt: accessToken.expiresAt,
						token: accessToken.token ?? '',
					}, // Lưu token để có thể thu hồi (revoke)
					ipAddress: ip,
					device: userAgent,
					lastActive: new Date().toISOString(),
				}
			)
			// Update last logged in timestamp
			await this.updateLastLoggedIn(existingUser.id)

			return { accessToken, sessionId, user: existingUser }
		} catch (error) {
			throw new UnauthorizedException('Incorrect email or password', {
				description: error,
			})
		}
	}

	private async updateLastLoggedIn(userId: string) {
		try {
			const updatedUser = await this.prismaService.$executeRaw`
      UPDATE "User"
      SET "lastLoginAt" = NOW()
      WHERE "id" = ${userId};
    `
			return updatedUser
		} catch (error) {
			throw new Error(
				`Failed to update last logined time: ${error.message}`
			)
		}
	}

	/**
	 * Get user profile from token payload id
	 *
	 * @param {number} userId - The ID of the user to retrieve.
	 * @returns {Promise<User | null>} The user object retrieved from the database, or null if not found.
	 *
	 * @throws {NotFoundException} If no user is found with the provided ID.
	 */
	async getProfile(userId: string): Promise<User | null> {
		try {
			const userData = await this.prismaService.user.findUnique({
				where: { id: userId },
				include: {
					department: true,
					jobTitle: true,
					role: {
						include: {
							permissions: true,
						},
					},
					securityLogs: true,
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

	async updateProfile(userId: string, data: UpdateProfileDto) {
		return await this.prismaService.user.update({
			where: { id: userId },
			data: {
				displayName: data.displayName,
				avatar: data.avatar,
				phoneNumber: data.phoneNumber,
				personalEmail: data.personalEmail,
			},
			include: {
				role: {
					include: { permissions: true },
				},
				department: true,
				jobTitle: true,
			},
		})
	}
	async getEffectivePermissions(userId: string) {
		// 1. Lấy User + Role + UserOverride
		const user = await this.prismaService.user.findUnique({
			where: { id: userId },
			include: {
				role: {
					include: { permissions: true }, // Lấy quyền gốc từ Role
				},
				userPermissions: {
					include: { permission: true }, // Lấy quyền riêng
				},
			},
		})

		if (!user) return []

		// 2. Tách quyền riêng thành 2 nhóm: Grant và Deny
		const grantedOverrides = user.userPermissions
			.filter((up) => !up.isDenied)
			.map((up) => up.permission.entityAction) // ['job.read']

		const deniedOverrides = user.userPermissions
			.filter((up) => up.isDenied)
			.map((up) => up.permission.entityAction) // ['user.delete']

		// 3. Lấy danh sách quyền từ Role (dạng string code)
		const rolePermissions =
			user.role?.permissions.map((p) => p.entityAction) || []

		// 4. Gộp quyền (Role + Grant)
		const allAllowed = new Set([...rolePermissions, ...grantedOverrides])

		// 5. Trừ đi quyền bị cấm (Exclude)
		deniedOverrides.forEach((deniedCode) => {
			allAllowed.delete(deniedCode)
		})

		// Trả về mảng quyền cuối cùng
		return Array.from(allAllowed)
	}

	// --- 1. Request Reset Link ---
	async forgotPassword(email: string) {
		// 1. Check if user exists
		const user = await this.prismaService.user.findUnique({
			where: { email },
			select: { id: true, email: true, displayName: true },
		})
		if (!user) {
			// Security: Don't reveal if user exists. Just return "ok".
			return { message: 'If email exists, reset link has been sent.' }
		}

		// 2. Generate a secure random token
		const token = randomBytes(32).toString('hex')

		// 3. Save to Redis with TTL (Time To Live)
		// Key: reset_token:abc123xyz
		// Value: user_id_123
		// Expiration: 900 seconds (15 minutes)
		const key = `reset_token:${token}`
		await this.redis.set(key, user.id, 'EX', 900)

		// 4. Send Email
		// Link format: https://frontend.com/reset-password?token=...
		await this.mailService.sendResetPasswordEmail(
			user.email,
			token,
			user.displayName
		)

		return { message: 'Reset link sent' }
	}

	// --- 2. Confirm & Change Password ---
	async resetPasswordWithToken(token: string, newPassword: string) {
		const key = `reset_token:${token}`

		// 1. Check Redis for the token
		const userId = await this.redis.get(key)

		if (!userId) {
			throw new BadRequestException('Token is invalid or has expired.')
		}

		// 2. Hash new password
		const hashedPassword = await this.bcryptService.hash(newPassword)

		// 3. Update User in DB
		await this.prismaService.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		})

		// 4. IMPORTANT: Delete the token so it can't be used again
		await this.redis.del(key)

		// Optional: Delete all other active sessions for this user (security best practice)
		// await this.redis.del(`session:${userId}`);

		return { message: 'Password updated successfully' }
	}
}
