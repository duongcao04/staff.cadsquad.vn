import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { ActivityType } from '@/generated/prisma';
import { APP_PERMISSIONS } from '@/utils';
import { ReviewDeliveryCommand } from '../impl/review-delivery.command';
import { JobActionEvent } from '../../events/job-action.event';

@CommandHandler(ReviewDeliveryCommand)
export class ReviewDeliveryHandler implements ICommandHandler<ReviewDeliveryCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2,
	) { }

	async execute(command: ReviewDeliveryCommand) {
		const { adminId, deliveryId, isApproved, feedback } = command;

		const result = await this.prisma.$transaction(async (tx) => {
			// 1. Cập nhật trạng thái của bản bàn giao (Delivery)
			const delivery = await tx.jobDelivery.update({
				where: { id: deliveryId },
				data: {
					status: isApproved ? 'APPROVED' : 'REJECTED',
					adminFeedback: feedback,
				},
			});

			// 2. Xác định mã trạng thái tiếp theo của Job
			const nextStatusCode = isApproved ? 'completed' : 'revision';
			const nextStatus = await tx.jobStatus.findUnique({
				where: { code: nextStatusCode },
			});

			if (!nextStatus) {
				throw new NotFoundException(`Status code '${nextStatusCode}' not found in DB`);
			}

			// 3. Cập nhật Job (Chuyển status và set ngày hoàn thành nếu approve)
			const jobUpdated = await tx.job.update({
				where: { id: delivery.jobId },
				data: {
					statusId: nextStatus.id,
					completedAt: isApproved ? new Date() : undefined,
				},
				include: {
					status: true,
					assignments: { include: { user: true } },
				},
			});

			// 4. Ghi Activity Log
			await tx.jobActivityLog.create({
				data: {
					jobId: delivery.jobId,
					modifiedById: adminId,
					fieldName: 'Status',
					activityType: isApproved ? ActivityType.APPROVE : ActivityType.REJECT,
					currentValue: nextStatus.displayName,
					notes: isApproved ? `Job approved.` : `Sent back for revision.`,
					metadata: !isApproved ? { adminFeedback: feedback } : {},
					requiredPermissionCode: APP_PERMISSIONS.JOB.REVIEW,
				},
			});

			return { delivery, jobUpdated };
		});

		// 5. Bắn Event (Thông báo cho Member biết kết quả duyệt bài)
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				isApproved ? ActivityType.APPROVE : ActivityType.REJECT,
				result.delivery.jobId,
				adminId,
				{ feedback },
				result.jobUpdated
			)
		);

		return result.delivery;
	}
}