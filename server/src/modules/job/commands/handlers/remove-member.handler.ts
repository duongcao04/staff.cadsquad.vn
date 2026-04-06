import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { ActivityType } from '@/generated/prisma';
import { APP_PERMISSIONS } from '@/utils';
import { RemoveMemberCommand } from '../impl/remove-member.command';
import { JobActionEvent } from '../../events/job-action.event';

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberHandler implements ICommandHandler<RemoveMemberCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2,
	) { }

	async execute(command: RemoveMemberCommand) {
		const { modifierId, jobId, userId } = command;

		// 1. Kiểm tra tồn tại của assignment
		const assignment = await this.prisma.jobAssignment.findUnique({
			where: { jobId_userId: { jobId, userId } },
			include: {
				user: { select: { displayName: true } },
				job: { select: { no: true, displayName: true } },
			},
		});

		if (!assignment) {
			throw new NotFoundException('Assignment not found');
		}

		// 2. Thực thi Transaction
		const jobUpdated = await this.prisma.$transaction(async (tx) => {
			// Xóa member khỏi job
			await tx.jobAssignment.delete({
				where: { jobId_userId: { jobId, userId } },
			});

			// Tính toán lại tổng Staff Cost của Job
			const aggregate = await tx.jobAssignment.aggregate({
				where: { jobId },
				_sum: { staffCost: true },
			});

			// Cập nhật lại Job
			const updated = await tx.job.update({
				where: { id: jobId },
				data: { totalStaffCost: aggregate._sum.staffCost || 0 },
				include: { status: true },
			});

			// Ghi Activity Log
			await tx.jobActivityLog.create({
				data: {
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.UNASSIGN_MEMBER,
					fieldName: 'jobAssignments',
					currentValue: assignment.user.displayName,
					notes: `[${updated.no}] Removed ${assignment.user.displayName} from the job`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_STAFF_COST,
					metadata: {
						removedUser: assignment.user.displayName,
						savedCost: assignment.staffCost,
					},
				},
			});

			return updated;
		});

		// 3. Bắn Event xử lý các side-effects (Gửi thông báo, update cache...)
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.UNASSIGN_MEMBER,
				jobId,
				modifierId,
				{ memberId: userId },
				jobUpdated
			)
		);

		return { success: true, removedUserId: userId };
	}
}