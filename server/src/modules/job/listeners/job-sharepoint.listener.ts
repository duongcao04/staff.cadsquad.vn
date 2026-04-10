import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { JobCreatedEvent } from '../events/job-created.event'
import { SharePointService } from '../../sharepoint/sharepoint.service'

@EventsHandler(JobCreatedEvent)
export class JobSharepointListener implements IEventHandler<JobCreatedEvent> {
	private readonly logger = new Logger(JobSharepointListener.name)

	constructor(private readonly sharepointService: SharePointService) {}

	async handle(event: JobCreatedEvent) {
		this.logger.log(
			`[JobSharepointListener] Bắt được sự kiện tạo job cho mã: ${event.jobNo}`
		)

		const sharepointFolderName = `${event.jobNo}- ${event.clientName.toUpperCase()}_${event.displayName.toUpperCase()}`

		// Giả sử bạn có logic lấy ID thư mục đích (có thể import thêm 1 service để lấy if needed)
		const destinationFolderCreationId = 'ID_CUA_THU_MUC_DICH'

		try {
			// Đẩy vào BullMQ Queue
			await this.sharepointService.queueCopyItem(
				event.sharepointTemplateId,
				destinationFolderCreationId,
				sharepointFolderName,
				event.jobNo // Truyền Job No để Worker update lại Database sau khi copy xong
			)

			this.logger.log(
				`Đã đẩy yêu cầu tạo folder Sharepoint cho Job ${event.jobNo} vào Queue.`
			)
		} catch (error) {
			this.logger.error(
				`Lỗi khi đẩy vào Sharepoint Queue: ${(error as { message: string }).message}`
			)
		}
	}
}

