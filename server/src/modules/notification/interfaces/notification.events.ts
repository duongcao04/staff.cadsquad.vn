import { NotificationTemplates } from "../templates/notification.templates";

// Đây là cấu trúc bắt buộc khi một Service nào đó muốn gửi thông báo
export interface NotifyEventPayload<T = any> {
	eventName: keyof typeof NotificationTemplates; // Ràng buộc phải gõ đúng tên template
	targetUserId: string; // ID của người nhận
	data: T; // Dữ liệu động (name, jobCode...) để nhét vào template
}