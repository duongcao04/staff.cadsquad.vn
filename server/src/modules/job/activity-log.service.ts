import { Injectable, NotFoundException } from '@nestjs/common'
import {
	ActivityType,
	JobActivityLog,
	Permission,
	Prisma,
	Role,
	User,
} from '../../generated/prisma'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { CreateActivityLogDto } from './dto/create-activity-log.dto'
import dayjs from 'dayjs'

type UserWithPermissions = User & {
	role: Role & {
		permissions: Permission[]
	}
}

@Injectable()
export class ActivityLogService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Create a new activity log with automatic note generation.
	 */
	async create(
		data: CreateActivityLogDto,
		tx?: Prisma.TransactionClient
	): Promise<JobActivityLog> {
		const client = tx || this.prisma
		const finalNotes = data.notes || this.generateDefaultNotes(data)

		return client.jobActivityLog.create({
			data: {
				jobId: data.jobId,
				modifiedById: data.modifiedById,
				fieldName: data.fieldName,
				currentValue: data.currentValue,
				activityType: data.activityType,
				notes: finalNotes,
				requiredPermissionCode: data.requiredPermissionCode,
				metadata: data.metadata as Prisma.InputJsonValue,
			},
		})
	}
	/**
	 * Fetch activity logs for a job and mask data based on user permissions.
	 * @param user - Current user with role code and permission code array
	 */
	async findByJobId(
		jobId: string,
		userRole: string,
		userPermissions: string[]
	): Promise<any[]> {
		const isAdmin = userRole === 'admin'

		// In your case, userPermissions is already string[] (e.g., ['job.view_financial', 'job.delete'])
		const permissions = userPermissions || []

		const logs = await this.prisma.jobActivityLog.findMany({
			where: { jobId },
			include: {
				modifiedBy: {
					select: {
						id: true,
						displayName: true,
						avatar: true,
					},
				},
			},
			orderBy: { modifiedAt: 'desc' },
		})

		return logs.map((log: any) => {
			// A user has permission if:
			// 1. The log is public (no permission code required)
			// 2. The user is an ADMIN
			// 3. The user's permission array contains the required code
			const hasPermission =
				!log.requiredPermissionCode ||
				isAdmin ||
				permissions.includes(log.requiredPermissionCode)

			// --- MASKING LOGIC (For restricted users) ---
			if (!hasPermission) {
				return {
					...log,
					previousValue: null,
					currentValue: null,
					metadata: null,
					// Replace specific sensitive notes with generic ones
					notes:
						log.activityType === ActivityType.PAID
							? `Job payment status updated.`
							: log.notes,
				}
			}

			// --- ENHANCEMENT LOGIC (For authorized users) ---
			// Append metadata details to the notes for a more professional audit view
			if (log.metadata && typeof log.metadata === 'object') {
				const meta = log.metadata as Record<string, any>

				if (
					log.activityType === ActivityType.REJECT &&
					meta.adminFeedback
				) {
					return {
						...log,
						notes: `${log.notes} Reason: ${meta.adminFeedback}`,
					}
				}

				if (
					log.activityType === ActivityType.UPDATE_MEMBER_COST &&
					(meta.newCost || meta.staffCost)
				) {
					const cost = meta.newCost || meta.staffCost
					return {
						...log,
						notes: `${log.notes} (New rate: ${cost.toLocaleString()} VND)`,
					}
				}
			}

			return log
		})
	}

	private generateDefaultNotes(data: CreateActivityLogDto): string {
		const field = data.fieldName || 'information'
		const current = data.currentValue || 'N/A'

		switch (data.activityType) {
			case ActivityType.CREATE_JOB:
				return `Created new job: ${current}`
			case ActivityType.ASSIGN_MEMBER:
				return `Assigned member ${current} to the job`
			case ActivityType.UNASSIGN_MEMBER:
				return `Removed member ${current} from the job`
			case ActivityType.FORCE_CHANGE_STATUS:
				return `Changed status to "${current}"`
			case ActivityType.DELIVER:
				return `Submitted a new delivery for review`
			case ActivityType.APPROVE:
				return `Approved delivery. Job status updated to Completed`
			case ActivityType.REJECT:
				return `Rejected delivery. Revision requested by Admin`
			case ActivityType.PAID:
				return data.currentValue
					? `Financial settlement completed. Job finished at: ${dayjs(current).format('DD/MM/YYYY')}`
					: `Job has been marked as fully paid.`
			case ActivityType.UPDATE_MEMBER_COST:
				return `Staff cost adjustment for ${field}`
			case ActivityType.UPDATE_GENERAL_INFORMATION:
				return `Updated ${field} to "${current}"`
			default:
				return `Modified ${field}`
		}
	}

	async findOne(id: string): Promise<JobActivityLog> {
		const log = await this.prisma.jobActivityLog.findUnique({
			where: { id },
			include: { modifiedBy: true, job: true },
		})
		if (!log) throw new NotFoundException('Activity log not found.')
		return log
	}

	async remove(id: string): Promise<JobActivityLog> {
		return this.prisma.jobActivityLog.delete({ where: { id } })
	}
}
