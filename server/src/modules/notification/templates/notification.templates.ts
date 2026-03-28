import { NotificationType } from '@/generated/prisma'; // Đổi theo enum của bạn

// Định nghĩa format trả về của một template
export interface NotificationTemplateResult {
	title: string;
	body: string;
	type: NotificationType;
}

// Từ điển chứa tất cả các mẫu thông báo
export const NotificationTemplates: Record<
	string,
	(data: any) => NotificationTemplateResult
> = {
	// 1. Template cho User
	'notify.user.created': (data: { name: string }) => ({
		title: 'Wellcome to CADSQUAD',
		body: `Congratulations ${data.name} has joined our system!`,
		type: 'USER_CREATED', // Hoặc enum tương ứng
	}),

	'notify.user.updated': (data: { name: string }) => ({
		title: 'Wellcome to CADSQUAD',
		body: `Congratulations ${data.name} has joined our system!`,
		type: 'USER_CREATED', // Hoặc enum tương ứng
	}),

	// 2. Template cho Job
	'notify.job.approved': (data: { jobCode: string; adminName: string }) => ({
		title: 'The job has been approved.',
		body: `Your job #${data.jobCode} has just been approved by ${data.adminName}.`,
		type: 'JOB_APPROVED',
	}),

	// Thêm bao nhiêu sự kiện tùy thích ở đây...
};