import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { ActivityType } from '@/generated/prisma';
import { APP_PERMISSIONS } from '@/utils';
import { JobActionEvent } from '../../events/job-action.event';
import { ActivityLogService } from '../../activity-log.service';
import { RestoreJobCommand } from '../impl/restore-job.command';

@CommandHandler(RestoreJobCommand)
export class RestoreJobHandler implements ICommandHandler<RestoreJobCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2,
		private readonly activityLogService: ActivityLogService,
	) { }

	async execute(command: RestoreJobCommand) {
		const { jobId, modifierId } = command;

		// 1. Kiểm tra Job tồn tại và trạng thái xóa
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: { status: true, assignments: true },
		});

		if (!job) throw new NotFoundException('Job not found');

		// 2. Thực thi Transaction để đảm bảo tính nhất quán
		const result = await this.prisma.$transaction(async (tx) => {
			const now = new Date();

			// Soft delete bằng cách cập nhật deletedAt và ẩn khỏi public
			const updated = await tx.job.update({
				where: { id: jobId },
				data: {
					deletedAt: null,
					isPublished: true
				},
				include: { status: true, assignments: true },
			});

			// Ghi Activity Log vào DB
			await this.activityLogService.create(
				{
					jobId: job.id,
					modifiedById: modifierId,
					activityType: ActivityType.DELETE,
					fieldName: 'deletedAt',
					currentValue: job.no,
					notes: `Job #${job.no} (${job.displayName}) was restored.`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.DELETE,
				},
				tx
			);

			return updated;
		});

		// 3. Bắn Event cho các side-effects (ví dụ: thông báo cho các thành viên được gán)
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.DELETE,
				jobId,
				modifierId,
				{},
				result
			)
		);

		return {
			id: result.id,
			no: job.no,
			message: 'Job moved to trash successfully',
		};
	}
}