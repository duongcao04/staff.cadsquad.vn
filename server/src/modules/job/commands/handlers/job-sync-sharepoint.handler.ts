import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { NotFoundException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { ActivityType } from '@/generated/prisma'
import { APP_PERMISSIONS } from '@/utils'
import { JobActionEvent } from '../../events/job-action.event'
import { JobSyncSharepointCommand } from '../impl/job-sync-sharepoint.command'

@CommandHandler(JobSyncSharepointCommand)
export class JobSyncSharepointHandler implements ICommandHandler<JobSyncSharepointCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2
	) {}

	async execute(command: JobSyncSharepointCommand) {
		const { modifierId, jobId } = command

		// 1. Check job tồn tại
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
		})

		if (!job) {
			throw new NotFoundException('Sync Sharepoint for this job failed')
		}

		// // 2. Thực thi Transaction
		// const jobUpdated = await this.prisma.$transaction(async (tx) => {
		// 	await tx.jobAssignment.delete({
		// 		where: { jobId_userId: { jobId, userId } },
		// 	})

		// 	// Tính toán lại tổng Staff Cost của Job
		// 	const aggregate = await tx.jobAssignment.aggregate({
		// 		where: { jobId },
		// 		_sum: { staffCost: true },
		// 	})

		// 	// Cập nhật lại Job
		// 	const updated = await tx.job.update({
		// 		where: { id: jobId },
		// 		data: { totalStaffCost: aggregate._sum.staffCost || 0 },
		// 		include: { status: true },
		// 	})

		// 	// Ghi Activity Log
		// 	await tx.jobActivityLog.create({
		// 		data: {
		// 			jobId,
		// 			modifiedById: modifierId,
		// 			activityType: ActivityType.UNASSIGN_MEMBER,
		// 			fieldName: 'jobAssignments',
		// 			currentValue: assignment.user.displayName,
		// 			notes: `[${updated.no}] Removed ${assignment.user.displayName} from the job`,
		// 			requiredPermissionCode: APP_PERMISSIONS.JOB.READ_STAFF_COST,
		// 			metadata: {
		// 				removedUser: assignment.user.displayName,
		// 				savedCost: assignment.staffCost,
		// 			},
		// 		},
		// 	})

		// 	return updated
		// })

		// // 3. Bắn Event xử lý các side-effects (Gửi thông báo, update cache...)
		// this.eventEmitter.emit(
		// 	'job.action',
		// 	new JobActionEvent(
		// 		ActivityType.UNASSIGN_MEMBER,
		// 		jobId,
		// 		modifierId,
		// 		{ memberId: userId },
		// 		jobUpdated
		// 	)
		// )

		return { success: true }
	}
}
