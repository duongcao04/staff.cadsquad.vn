import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { JobCreatedEvent } from '../events/job-created.event'
import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { JOB_QUEUE, JOB_CREATED_HANDLER } from '../job.constants'
import { PrismaService } from '../../../providers/prisma/prisma.service'

@EventsHandler(JobCreatedEvent)
export class JobSharepointListener implements IEventHandler<JobCreatedEvent> {
	private readonly logger = new Logger(JobSharepointListener.name)

	constructor(
		@InjectQueue(JOB_QUEUE) private readonly spQueue: Queue,
		private readonly prisma: PrismaService
	) {}

	async handle(event: JobCreatedEvent) {
		// Giả sử event.data chứa object CreateJobDto
		const dto = event.data

		this.logger.log(
			`[JobSharepointListener] Bắt được sự kiện tạo job cho mã: ${dto.no}`
		)

		try {
			const useExistingSharepointFolder =
				dto.useExistingSharepointFolder === '1'

			// 1. NẾU LÀ LUỒNG NHANH (Folder có sẵn) -> Đã xử lý DB ở CreateJobHandler -> BỎ QUA QUEUE
			if (useExistingSharepointFolder) {
				this.logger.log(
					`Job ${dto.no} sử dụng Folder có sẵn. Bỏ qua Queue.`
				)
				return
			}

			// Gom dữ liệu cần thiết cho Queue
			const payload = {
				...dto,
			}

			await this.spQueue.add(JOB_CREATED_HANDLER, payload)

			this.logger.log(
				`Đã đẩy yêu cầu COPY folder Sharepoint cho Job ${dto.no} vào Queue.`
			)
		} catch (error) {
			this.logger.error(
				`Lỗi khi xử lý đẩy vào Sharepoint Queue: ${(error as Error).message}`
			)
		}
	}

	// Hàm lấy ID thư mục đích (Chuyển từ CreateJobHandler sang đây cho đúng chuẩn sự kiện)
	private async getDestinationFolderCreationId(
		jobTypeId: string
	): Promise<string> {
		const jobType = await this.prisma.jobType.findUnique({
			where: { id: jobTypeId },
			select: { sharepointFolderId: true }, // Dùng select cho nhẹ query
		})

		if (!jobType?.sharepointFolderId) {
			throw new Error(
				'Please check destination folder creation id for type ' +
					jobTypeId
			)
		}
		return jobType.sharepointFolderId
	}
}
