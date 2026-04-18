import { ActivityType, Prisma } from '@/generated/prisma'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { InjectQueue } from '@nestjs/bullmq'
import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Queue } from 'bullmq'
import { plainToInstance } from 'class-transformer'
import slugify from 'slugify'
import { SharePointService } from '../../../sharepoint/sharepoint.service'
import { ActivityLogService } from '../../activity-log.service'
import { CreateJobDto } from '../../dto/create-job.dto'
import { JobResponseDto } from '../../dto/job-response.dto'
import { JobActionEvent } from '../../events/job-action.event'
import { JOB_CREATED_HANDLER, JOB_QUEUE } from '../../job.constants'
import { CreateJobCommand } from '../impl/create-job.command'
import { JobCreatedEvent } from '../../events/job-created.event'
import { JobCreatedHandlerDto } from '../../dto/queue/job-created-handler.dto'

@CommandHandler(CreateJobCommand)
export class CreateJobHandler implements ICommandHandler<CreateJobCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly activityLogService: ActivityLogService,
		private readonly sharepointService: SharePointService,
		private readonly eventBus: EventBus,
		@InjectQueue(JOB_QUEUE) private readonly spQueue: Queue
	) {}

	async execute(command: CreateJobCommand) {
		const { creatorId, dto } = command

		const defaultStatus = await this.prisma.jobStatus.findUnique({
			where: { order: 1 },
		})
		if (!defaultStatus)
			throw new InternalServerErrorException(
				'Initial status order 1 not found'
			)

		const {
			jobAssignments,
			clientName,
			typeId,
			paymentChannelId,
			incomeCost,
			totalStaffCost,
			attachmentUrls,
			sharepointFolderId,
			useExistingSharepointFolder,
			sharepointTemplateId: folderTemplateId,
			...jobData
		} = dto

		// Xử lý Transaction y hệt logic cũ của bạn
		const newJob = await this.prisma.$transaction(async (tx) => {
			const client = await this.getClient(tx, dto.clientName)

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

			await this.activityLogService.create(
				{
					jobId: createdJob.id,
					modifiedById: creatorId,
					activityType: ActivityType.CREATE_JOB,
					fieldName: 'Job',
					currentValue: createdJob.no,
					requiredPermissionCode: 'job.view_financial',
					metadata: {
						clientName: client.name,
						assignmentCount: jobAssignments?.length || 0,
					},
				},
				tx
			)

			return createdJob
		})

		// Send notification
		this.eventBus.publish(
			new JobActionEvent(
				ActivityType.CREATE_JOB,
				newJob.id,
				creatorId,
				{},
				newJob
			)
		)
		this.eventBus.publish(
			new JobCreatedEvent({
				clientName: clientName,
				displayName: dto.displayName,
				no: dto.no,
				sharepointTemplateId: dto.sharepointTemplateId,
				typeId: dto.typeId,
				useExistingSharepointFolder: dto.useExistingSharepointFolder,
			})
		)

		return plainToInstance(JobResponseDto, newJob, {
			excludeExtraneousValues: true,
		})
	}

	private async getClient(tx: Prisma.TransactionClient, clientName: string) {
		const client = await tx.client.findUnique({
			where: { name: clientName },
		})

		if (!client) {
			const baseCode = slugify(clientName, {
				lower: true,
				strict: true,
			}).toUpperCase()
			const existing = await tx.client.findUnique({
				where: { code: baseCode },
			})
			const newClientCode = existing
				? `${baseCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
				: baseCode

			return await tx.client.create({
				data: { name: clientName, code: newClientCode },
			})
		}

		return client
	}
}
