import { Logger, NotFoundException } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { JobCreatedEvent } from '../events/job-created.event'
import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { JOB_QUEUE, JOB_CREATED_HANDLER } from '../job.constants'
import { PrismaService } from '../../../providers/prisma/prisma.service'
import { JobCreatedHandlerDto } from '../dto/queue/job-created-handler.dto'

@EventsHandler(JobCreatedEvent)
export class JobSharepointListener implements IEventHandler<JobCreatedEvent> {
	private readonly logger = new Logger(JobSharepointListener.name)

	constructor(
		@InjectQueue(JOB_QUEUE) private readonly spQueue: Queue,
		private readonly prisma: PrismaService
	) {}

	async handle(event: JobCreatedEvent) {
		// Giả sử event.data chứa object CreateJobDto
		const {
			typeId,
			sharepointTemplateId: folderTemplateId,
			useExistingSharepointFolder,
			no,
			displayName,
			clientName,
		} = event.data

		this.logger.log(
			`[JobSharepointListener] Bắt được sự kiện tạo job cho mã: ${no}`
		)
		try {
			// 1. NẾU LÀ LUỒNG NHANH (Folder có sẵn) -> Đã xử lý DB ở CreateJobHandler -> BỎ QUA QUEUE
			if (useExistingSharepointFolder === '1') {
				this.logger.log(
					`Job ${no} sử dụng Folder có sẵn. Bỏ qua Queue.`
				)
				return
			}

			// Gom dữ liệu cần thiết cho Queue
			const sharepointFolderName = `${no}- ${clientName.toUpperCase()}_${displayName.toUpperCase()}`
			const destinationFolderCreationId =
				await this.getDestinationFolderCreationId(typeId)
			const sharepointTemplateId =
				folderTemplateId &&
				(await this.getTemplateSharepointId(folderTemplateId))
			const payload: JobCreatedHandlerDto = {
				sharepointFolderName,
				destinationFolderCreationId: destinationFolderCreationId,
				folderTemplateId: folderTemplateId,
				jobNo: no,
				sharepointFolderTemplateId: sharepointTemplateId,
			}

			await this.spQueue.add(JOB_CREATED_HANDLER, payload)

			this.logger.log(
				`Đã đẩy yêu cầu COPY folder Sharepoint cho Job ${no} vào Queue.`
			)
		} catch (error) {
			this.logger.error(
				`Lỗi khi xử lý đẩy vào Sharepoint Queue: ${(error as Error).message}`
			)
		}
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

	private async getTemplateSharepointId(
		folderTemplateId: string
	): Promise<string> {
		const folderTemplate = await this.prisma.jobFolderTemplate.findUnique({
			where: { id: folderTemplateId },
		})

		if (!folderTemplate?.folderId) {
			throw new NotFoundException(
				'Not found sharepointId for folder template ' + folderTemplateId
			)
		}
		return folderTemplate.folderId
	}
}
