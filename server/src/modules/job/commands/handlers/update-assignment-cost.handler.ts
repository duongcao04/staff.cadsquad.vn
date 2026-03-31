import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { ActivityType } from '@/generated/prisma';
import { APP_PERMISSIONS } from '@/utils';
import { UpdateAssignmentCostCommand } from '../impl/update-assignment-cost.command';
import { JobActionEvent } from '../../events/job-action.event';

@CommandHandler(UpdateAssignmentCostCommand)
export class UpdateAssignmentCostHandler implements ICommandHandler<UpdateAssignmentCostCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2,
	) { }

	async execute(command: UpdateAssignmentCostCommand) {
		const { modifierId, jobId, memberId, dto } = command;
		const { staffCost } = dto;

		// 1. Kiểm tra tồn tại của assignment và lấy thông tin để log
		const currentAssignment = await this.prisma.jobAssignment.findUnique({
			where: { jobId_userId: { userId: memberId, jobId: jobId } },
			include: {
				user: { select: { displayName: true } },
				job: { select: { no: true, displayName: true } },
			},
		});

		if (!currentAssignment) {
			throw new NotFoundException('Assignment not found');
		}

		// 2. Thực thi Transaction
		const jobUpdated = await this.prisma.$transaction(async (tx) => {
			// Cập nhật giá vốn cho member cụ thể
			await tx.jobAssignment.update({
				where: { jobId_userId: { userId: memberId, jobId: jobId } },
				data: { staffCost },
			});

			// Tính toán lại tổng Staff Cost của Job (Aggregate)
			const aggregate = await tx.jobAssignment.aggregate({
				where: { jobId },
				_sum: { staffCost: true },
			});

			// Cập nhật lại tổng vào bảng Job
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
					activityType: ActivityType.UPDATE_MEMBER_COST,
					fieldName: currentAssignment.user.displayName,
					currentValue: `${staffCost.toLocaleString()} VND`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_STAFF_COST,
					metadata: {
						targetUser: currentAssignment.user.displayName,
						oldCost: currentAssignment.staffCost,
						newCost: staffCost,
					},
				},
			});

			return updated;
		});

		// 3. Bắn Event xử lý các side-effects (Email thông báo, Cache...)
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.UPDATE_MEMBER_COST,
				jobId,
				modifierId,
				{ memberId },
				jobUpdated
			)
		);

		return jobUpdated;
	}
}