import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
	BadRequestException,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common'
import { CreateJobCommand } from '../impl/create-job.command'
import { ActivityLogService } from '../../activity-log.service'
import { ActivityType, Prisma } from '@/generated/prisma'
import { JobActionEvent } from '../../events/job-action.event'
import { plainToInstance } from 'class-transformer'
import { JobResponseDto } from '../../dto/job-response.dto'
import slugify from 'slugify'
import { randomUUID } from 'node:crypto'
import { SharePointService } from '../../../sharepoint/sharepoint.service'
import { CreateJobDto } from '../../dto/create-job.dto'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { JOB_CREATED_HANDLER, JOB_QUEUE } from '../../job.constants'
import { JOB_CREATE_FOLDER } from '../../../sharepoint/sharepoint.constants'

@CommandHandler(CreateJobCommand)
export class CreateJobHandler implements ICommandHandler<CreateJobCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly activityLogService: ActivityLogService,
		private readonly sharepointService: SharePointService,
		private readonly eventEmitter: EventEmitter2,
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

		await this.afterCreateJob(dto)

		// Bắn event sau khi transaction thành công
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.CREATE_JOB,
				newJob.id,
				creatorId,
				{},
				newJob
			)
		)

		return plainToInstance(JobResponseDto, newJob, {
			excludeExtraneousValues: true,
		})
	}

	private async afterCreateJob(dto: CreateJobDto) {
		const destinationFolderCreationId =
			await this.getDestinationFolderCreationId(dto.typeId)
		const payload = { destinationFolderCreationId, ...dto }
		await this.spQueue.add(JOB_CREATED_HANDLER, payload)
	}

	private async getDestinationFolderCreationId(
		jobTypeId: string
	): Promise<string> {
		const jobType = await this.prisma.jobType.findUnique({
			where: { id: jobTypeId },
		})

		if (!jobType?.sharepointFolderId) {
			throw new NotFoundException(
				'Please check destination folder creation id for type ' +
					jobTypeId
			)
		}
		return jobType.sharepointFolderId
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

