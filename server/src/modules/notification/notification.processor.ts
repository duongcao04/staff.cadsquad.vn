import { NotificationType } from '@/generated/prisma'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { AblyService } from '../ably/ably.service'
import {
	JOB_SEND_NOTIFICATION,
	NOTIFICATION_QUEUE,
} from './notification.constants'

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
	private readonly logger = new Logger(NotificationProcessor.name)

	constructor(
		private readonly ablyService: AblyService,
	) {
		super()
	}

	async process(job: Job<any>): Promise<any> {
		switch (job.name) {
			case JOB_SEND_NOTIFICATION:
				return this.handleSendNotification(job.data)
			default:
				this.logger.warn(`Unknown job name: ${job.name}`)
		}
	}

	/**
	 * Xử lý gửi 1 thông báo (Ably + Firebase)
	 */
	private async handleSendNotification(notification: any) {
		try {
			// 1. Gửi Realtime (Ably)
			await this.ablyService.publish(
				`user-notifications:${notification.userId}`,
				notification.type || NotificationType.INFO,
				{
					...notification,
					createdAt: notification.createdAt || new Date(),
				}
			)

			this.logger.log(`Sent notification to User ${notification.userId}`)
		} catch (error) {
			this.logger.error(
				`Failed to send notification: ${error.message}`,
				error.stack
			)
			throw error // Ném lỗi để BullMQ retry
		}
	}
}
