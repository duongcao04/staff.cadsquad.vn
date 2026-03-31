import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { ActivityType, Prisma } from '@/generated/prisma';
import { APP_PERMISSIONS } from '@/utils';
import { ConfirmPaymentCommand } from '../impl/confirm-payment.command';
import { JobActionEvent } from '../../events/job-action.event';
import { ActivityLogService } from '../../activity-log.service';

@CommandHandler(ConfirmPaymentCommand)
export class ConfirmPaymentHandler implements ICommandHandler<ConfirmPaymentCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2,
		private readonly activityLogService: ActivityLogService,
	) { }

	async execute(command: ConfirmPaymentCommand) {
		const { jobId, modifierId } = command;

		// 1. Kiểm tra Job và trạng thái thanh toán
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				status: true,
				assignments: { include: { user: true } },
			},
		});

		if (!job || job.isPaid) {
			throw new BadRequestException('Job already paid or not found');
		}

		// 2. Thực thi Transaction quyết toán
		const updatedJob = await this.prisma.$transaction(async (tx) => {
			const now = new Date();

			// Tìm status hệ thống TERMINATED (đã đóng hồ sơ)
			const finishStatus = await tx.jobStatus.findFirst({
				where: { systemType: 'TERMINATED' },
			});

			const updateData: Prisma.JobUpdateInput = {
				paymentStatus: 'PAID',
				payoutDate: now,
			};

			// Logic: Nếu đã xong việc (COMPLETED) mà giờ mới trả tiền thì đóng Job luôn (TERMINATED)
			if (job.status.systemType === 'COMPLETED') {
				updateData.status = { connect: { id: finishStatus?.id } };
				updateData.finishedAt = now;
			}

			const updated = await tx.job.update({
				where: { id: jobId },
				data: updateData,
				include: { assignments: { include: { user: true } } },
			});

			// Ghi log tài chính
			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					fieldName: 'Payment Status',
					activityType: ActivityType.PAID,
					currentValue: now.toISOString(),
					requiredPermissionCode: APP_PERMISSIONS.JOB.PAID,
					metadata: {
						incomeCost: job.incomeCost,
						totalStaffCost: job.totalStaffCost,
						payoutDate: now,
					},
				},
				tx
			);

			return updated;
		});

		// 3. Bắn Event (Side effect: Gửi mail báo cho team leader, update báo cáo doanh thu)
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.PAID,
				jobId,
				modifierId,
				{},
				updatedJob
			)
		);

		return { id: updatedJob.id, no: updatedJob.no };
	}
}