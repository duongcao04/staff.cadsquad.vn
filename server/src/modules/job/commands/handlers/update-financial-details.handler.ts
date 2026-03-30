import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { ActivityType, Prisma } from '@/generated/prisma';
import { APP_PERMISSIONS } from '@staff-cadsquad/shared';
import { UpdateFinancialDetailsCommand } from '../impl/update-financial-details.command';
import { JobActionEvent } from '../../events/job-action.event';
import { ActivityLogService } from '../../activity-log.service';

@CommandHandler(UpdateFinancialDetailsCommand)
export class UpdateFinancialDetailsHandler implements ICommandHandler<UpdateFinancialDetailsCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2,
		private readonly activityLogService: ActivityLogService,
	) { }

	async execute(command: UpdateFinancialDetailsCommand) {
		const { modifierId, jobId, dto } = command;

		// 1. Validate đầu vào
		if (!dto.incomeCost && !dto.paymentChannelId) {
			throw new BadRequestException('No financial data provided for update');
		}

		// 2. Kiểm tra Job tồn tại
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: { paymentChannel: true },
		});
		if (!job) throw new NotFoundException('Job not found');

		// 3. Thực thi Transaction
		const updatedJob = await this.prisma.$transaction(async (tx) => {
			const updateData: Prisma.JobUpdateInput = {};

			if (dto.paymentChannelId) {
				updateData.paymentChannel = { connect: { id: dto.paymentChannelId } };
			}

			if (dto.incomeCost) {
				updateData.incomeCost = parseFloat(dto.incomeCost.toString());
			}

			const updated = await tx.job.update({
				where: { id: jobId },
				data: updateData,
				include: { paymentChannel: true },
			});

			// Ghi Activity Log với thông tin so sánh cũ/mới
			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.UPDATE_GENERAL_INFORMATION,
					fieldName: 'Revenue/Payment Channel',
					notes: `${job.incomeCost?.toLocaleString()} VND via ${job.paymentChannel?.displayName || 'N/A'}`,
					currentValue: `${updated.incomeCost?.toLocaleString()} VND via ${updated.paymentChannel?.displayName || 'N/A'}`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_STAFF_COST,
					metadata: {
						oldCost: job.incomeCost,
						newCost: updated.incomeCost,
					},
				},
				tx
			);

			return updated;
		});

		// 4. Bắn Event cho side-effects
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.UPDATE_GENERAL_INFORMATION,
				jobId,
				modifierId,
				{ isRevenueUpdate: true },
				updatedJob
			)
		);

		return { id: updatedJob.id, no: updatedJob.no };
	}
}