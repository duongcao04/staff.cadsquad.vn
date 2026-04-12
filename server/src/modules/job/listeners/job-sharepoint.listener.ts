import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { JobCreatedEvent } from '../events/job-created.event'
import { SharePointService } from '../../sharepoint/sharepoint.service'
import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { JOB_QUEUE, JOB_CREATED_HANDLER } from '../job.constants'

@EventsHandler(JobCreatedEvent)
export class JobSharepointListener implements IEventHandler<JobCreatedEvent> {
	private readonly logger = new Logger(JobSharepointListener.name)

	constructor(@InjectQueue(JOB_QUEUE) private readonly spQueue: Queue) {}

	async handle(event: JobCreatedEvent) {
		this.logger.log(
			`[JobSharepointListener] Bắt được sự kiện tạo job cho mã: ${event.data.no}`
		)

		try {
			await this.spQueue.add(JOB_CREATED_HANDLER, event)

			this.logger.log(
				`Đã đẩy yêu cầu tạo folder Sharepoint cho Job ${event.data.no} vào Queue.`
			)
		} catch (error) {
			this.logger.error(
				`Lỗi khi đẩy vào Sharepoint Queue: ${(error as { message: string }).message}`
			)
		}
	}
}
