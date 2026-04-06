import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { ActivityType, Prisma } from '@/generated/prisma';
import { ForceChangeStatusCommand } from '../impl/force-change-status.command';
import { JobActionEvent } from '../../events/job-action.event';
import { ActivityLogService } from '../../activity-log.service';

@CommandHandler(ForceChangeStatusCommand)
export class ForceChangeStatusHandler implements ICommandHandler<ForceChangeStatusCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2,
		private readonly activityLogService: ActivityLogService,
	) { }

	async execute(command: ForceChangeStatusCommand) {
		const { jobId, modifierId, dto } = command;

		// 1. Kiểm tra Job và Target Status
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: { status: true, assignments: true },
		});
		if (!job) throw new NotFoundException('Job not found');

		const targetStatus = await this.prisma.jobStatus.findUnique({
			where: { code: dto.newStatus },
		});
		if (!targetStatus) throw new NotFoundException('Target status not found');

		// 2. Thực thi Transaction
		const updatedJob = await this.prisma.$transaction(async (tx) => {
			const now = new Date();
			const updateData: Prisma.JobUpdateInput = {
				status: { connect: { id: targetStatus.id } },
			};

			// Logic tự động cập nhật các mốc thời gian dựa trên loại trạng thái hệ thống
			if (targetStatus.systemType === 'COMPLETED') {
				updateData.completedAt = now;
			}

			if (targetStatus.systemType === 'TERMINATED') {
				updateData.finishedAt = now;
				updateData.paymentStatus = 'PAID';
				// Chỉ cập nhật ngày thanh toán nếu trước đó chưa có
				if (!job.payoutDate) updateData.payoutDate = now;
			}

			const result = await tx.job.update({
				where: { id: jobId },
				data: updateData,
				include: {
					status: true,
					assignments: { include: { user: true } },
				},
			});

			// Ghi Activity Log
			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					fieldName: 'Status',
					activityType: ActivityType.FORCE_CHANGE_STATUS,
					currentValue: targetStatus.displayName,
				},
				tx
			);

			return result;
		});

		// 3. Bắn Event (Side effects như gửi notification cho Team)
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.FORCE_CHANGE_STATUS,
				jobId,
				modifierId,
				{ oldStatusName: job.status.displayName },
				updatedJob
			)
		);

		return {
			id: jobId,
			no: updatedJob.no,
			displayName: updatedJob.displayName
		};
	}
}