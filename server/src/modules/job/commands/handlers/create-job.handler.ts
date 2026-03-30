import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateJobCommand } from '../impl/create-job.command';
import { ActivityLogService } from '../../activity-log.service';
import { ActivityType } from '@/generated/prisma';
import { JobActionEvent } from '../../events/job-action.event';
import { plainToInstance } from 'class-transformer';
import { JobResponseDto } from '../../dto/job-response.dto';
import slugify from 'slugify';

@CommandHandler(CreateJobCommand)
export class CreateJobHandler implements ICommandHandler<CreateJobCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly activityLogService: ActivityLogService,
		private readonly eventEmitter: EventEmitter2,
	) { }

	async execute(command: CreateJobCommand) {
		const { creatorId, dto } = command;

		const defaultStatus = await this.prisma.jobStatus.findUnique({
			where: { order: 1 },
		});
		if (!defaultStatus) throw new InternalServerErrorException('Initial status order 1 not found');

		const { jobAssignments, clientName, typeId, paymentChannelId, incomeCost, totalStaffCost, attachmentUrls, sharepointFolderId, ...jobData } = dto;

		// Xử lý Transaction y hệt logic cũ của bạn
		const newJob = await this.prisma.$transaction(async (tx) => {
			let client = await tx.client.findUnique({ where: { name: clientName } });

			if (!client) {
				const baseCode = slugify(clientName, { lower: true, strict: true }).toUpperCase();
				const existing = await tx.client.findUnique({ where: { code: baseCode } });
				const newClientCode = existing ? `${baseCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}` : baseCode;

				client = await tx.client.create({
					data: { name: clientName, code: newClientCode },
				});
			}

			const createdJob = await tx.job.create({
				data: {
					...jobData,
					status: { connect: { id: defaultStatus.id } },
					createdBy: { connect: { id: creatorId } },
					type: { connect: { id: typeId } },
					paymentChannel: paymentChannelId
						? { connect: { id: paymentChannelId } }
						: undefined,
					incomeCost: parseFloat(incomeCost as any) || 0,
					totalStaffCost: parseFloat(totalStaffCost as any) || 0,
					client: { connect: { id: client.id } },
					sharepointFolderId: sharepointFolderId || undefined,
					attachmentUrls: Array.isArray(attachmentUrls)
						? attachmentUrls
						: [],
					assignments: {
						create:
							jobAssignments?.map((asgn) => ({
								user: { connect: { id: asgn.userId } },
								staffCost:
									parseFloat(asgn.staffCost as any) || 0,
							})) || [],
					},
				},
				include: {
					status: true,
					client: true,
					assignments: {
						include: {
							user: {
								select: {
									id: true,
									displayName: true,
									email: true,
									personalEmail: true,
								},
							},
						},
					},
				},
			})

			await this.activityLogService.create({
				jobId: createdJob.id,
				modifiedById: creatorId,
				activityType: ActivityType.CREATE_JOB,
				fieldName: 'Job',
				currentValue: createdJob.no,
				requiredPermissionCode: 'job.view_financial',
				metadata: { clientName: client.name, assignmentCount: jobAssignments?.length || 0 },
			}, tx);

			return createdJob;
		});

		// Bắn event sau khi transaction thành công
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(ActivityType.CREATE_JOB, newJob.id, creatorId, {}, newJob)
		);

		return plainToInstance(JobResponseDto, newJob, { excludeExtraneousValues: true });
	}
}