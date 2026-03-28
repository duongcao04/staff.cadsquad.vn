import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import type { NotifyEventPayload } from './interfaces/notification.events';
import { NotificationTemplates } from './templates/notification.templates';

@Injectable()
export class NotificationListener {
	private readonly logger = new Logger(NotificationListener.name);

	constructor(private readonly notificationService: NotificationService) { }

	// Bắt tất cả sự kiện có tiền tố 'notify.'
	// { async: true } giúp Listener chạy ở một luồng độc lập, không block request
	@OnEvent('notify.*', { async: true })
	async handleWildcardNotification(payload: NotifyEventPayload) {
		try {
			const { eventName, targetUserId, data } = payload;

			// 1. Tìm template tương ứng trong từ điển
			const templateFn = NotificationTemplates[eventName];

			if (!templateFn) {
				this.logger.warn(`Bỏ qua: Không tìm thấy template cho sự kiện [${eventName}]`);
				return;
			}

			// 2. Build nội dung thông báo từ template + data động
			const notificationContent = templateFn(data);

			// 3. Gọi hàm send() của bạn (Lưu DB + Đẩy Queue)
			await this.notificationService.send({
				userId: targetUserId,
				title: notificationContent.title,
				content: notificationContent.body,
				type: notificationContent.type,
			});

			this.logger.debug(`Đã đưa thông báo [${eventName}] vào hàng đợi cho User ${targetUserId}`);
		} catch (error) {
			this.logger.error(`Lỗi xử lý sự kiện thông báo: ${(error as { message: String }).message}`, (error as { stack: String }).stack);
		}
	}
}