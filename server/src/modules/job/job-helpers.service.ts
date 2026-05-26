import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { APP_PERMISSIONS } from '@/utils'
import slugify from 'slugify'
import { Prisma } from '../../generated/prisma'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { AuthService } from '../auth/auth.service'
import { UserService } from '../user/user.service'

@Injectable()
export class JobHelpersService {
	constructor(
		private readonly authService: AuthService,
		private readonly prismaService: PrismaService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService
	) {}

	async mapRoleBasedData(
		rawData: Prisma.JobGetPayload<{
			include: { assignments: { include: { user: true } } }
		}>[],
		userId: string
	) {
		const userPermissions =
			await this.authService.getEffectivePermissions(userId)
		const canReadStaffCost = userPermissions.includes(
			APP_PERMISSIONS.JOB.READ_STAFF_COST
		)

		return rawData.map((job) => {
			const personalCost = job.assignments?.find(
				(a: any) => a.userId === userId || a.user?.id === userId
			)?.staffCost

			return {
				...job,
				totalStaffCost: canReadStaffCost
					? job.totalStaffCost
					: undefined,
				staffCost: personalCost ?? undefined,
				assignments: job.assignments?.map((asm: any) => ({
					...asm,
					staffCost: canReadStaffCost ? asm.staffCost : undefined,
					user: asm.user
						? {
								id: asm.user.id,
								displayName: asm.user.displayName,
								username: asm.user.username,
								avatar: asm.user.avatar,
								department: asm.user.department,
								code: asm.user.code,
							}
						: undefined,
				})),
			}
		})
	}

	async buildPermission(userId: string): Promise<Prisma.JobWhereInput> {
		const [permissions, scopeMap] = await Promise.all([
			this.authService.getEffectivePermissions(userId),
			this.authService.getPermissionScopeMap(userId),
		])

		// Admin bypass — không check scope
		if (permissions.includes(APP_PERMISSIONS.JOB.MANAGE)) {
			return {}
		}

		// OWN filter: job mình tạo HOẶC được assign vào
		const ownFilter: Prisma.JobWhereInput = {
			OR: [
				{ createdById: userId },
				{ assignments: { some: { userId } } },
			],
		}

		if (permissions.includes(APP_PERMISSIONS.JOB.READ_ALL)) {
			const scope = scopeMap.get(APP_PERMISSIONS.JOB.READ_ALL) ?? 'ALL'

			if (scope === 'ALL') return {}

			if (scope === 'DEPARTMENT') {
				const user = await this.prismaService.user.findUnique({
					where: { id: userId },
					select: { departmentId: true },
				})
				if (!user?.departmentId) return ownFilter
				return {
					assignments: {
						some: { user: { departmentId: user.departmentId } },
					},
				}
			}

			// scope === 'OWN'
			return ownFilter
		}

		// Không có permission đặc biệt (ví dụ: role Sale)
		// Chỉ thấy job mình tạo hoặc được assign vào
		return ownFilter
	}

	async generateClientCode(
		name: string,
		tx: Prisma.TransactionClient
	): Promise<string> {
		const baseCode = slugify(name, {
			lower: true,
			strict: true,
		}).toUpperCase()
		const existingClient = await tx.client.findUnique({
			where: { code: baseCode },
			select: { id: true },
		})
		if (!existingClient) return baseCode
		const shortId = Math.random().toString(36).substring(2, 6).toUpperCase()
		return `${baseCode}-${shortId}`
	}
}
