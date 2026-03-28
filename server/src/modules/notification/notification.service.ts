import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { CreateNotificationDto } from './dto/create-notification.dto'
import { NotificationResponseDto } from './dto/notification-response.dto'
import { plainToInstance } from 'class-transformer'
import { NotificationStatus } from '@/generated/prisma'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import {
	NOTIFICATION_QUEUE,
	JOB_SEND_NOTIFICATION,
} from './notification.constants'

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name)

	constructor(
		private readonly prisma: PrismaService,
		// Inject Queue thay vì Ably/Firebase Service trực tiếp
		@InjectQueue(NOTIFICATION_QUEUE)
		private readonly notificationQueue: Queue
	) { }

	/**
	 * Gửi 1 thông báo
	 */
	async send(data: CreateNotificationDto): Promise<NotificationResponseDto> {
		// 1. Lưu DB trước để đảm bảo dữ liệu toàn vẹn
		const notification = await this.prisma.notification.create({ data })

		// 2. Đẩy vào Queue để xử lý bất đồng bộ (Ably + Firebase)
		await this.notificationQueue.add(JOB_SEND_NOTIFICATION, notification, {
			attempts: 3,
			removeOnComplete: true,
			backoff: { type: 'exponential', delay: 1000 },
		})

		return plainToInstance(NotificationResponseDto, notification, {
			excludeExtraneousValues: true,
		})
	}

	/**
	 * Gửi thông báo cho Role
	 */
	async sendToRole(
		roleId: string,
		data: Omit<CreateNotificationDto, 'userId'>
	) {
		const users = await this.prisma.user.findMany({
			where: { role: { id: roleId }, isActive: true },
			select: { id: true },
		})

		const dataArray = users.map((user) => ({
			...data,
			userId: user.id,
		})) as CreateNotificationDto[]

		return this.sendMany(dataArray)
	}

	/**
	 * Wrapper tiện ích: Gửi thông báo cho 1 User cụ thể
	 * (Tách userId ra để tái sử dụng object data dễ dàng hơn)
	 */
	async sendToUser(
		userId: string,
		data: Omit<CreateNotificationDto, 'userId'>
	) {
		// Tái sử dụng hàm send (đã có logic lưu DB + đẩy Queue)
		return this.send({
			...data,
			userId,
		} as CreateNotificationDto)
	}

	/**
	 * (Bonus) Wrapper: Gửi cho một danh sách User ID cụ thể
	 * VD: Gửi cho team dự án, nhóm chat...
	 */
	async sendToUsers(
		userIds: string[],
		data: Omit<CreateNotificationDto, 'userId'>
	) {
		if (!userIds.length) return

		// Chống duplicate - 1 user nhận được 2 noti
		const dataArray = [...new Set(userIds)].map((id) => ({
			...data,
			userId: id,
		})) as CreateNotificationDto[]

		// Tái sử dụng hàm sendMany (Bulk insert + Bulk Queue)
		return this.sendMany(dataArray)
	}

	/**
	 * Gửi hàng loạt (Bulk Send)
	 */
	async sendMany(dataArray: CreateNotificationDto[]): Promise<void> {
		if (!dataArray.length) return

		try {
			// 1. Lưu DB hàng loạt (Nhanh)
			// Lưu ý: createMany không trả về bản ghi đã tạo, nên ta sẽ push raw data vào queue
			// (Processor sẽ tự xử lý việc thiếu ID hoặc bạn có thể query lại nếu cần ID chính xác)
			await this.prisma.notification.createMany({
				data: dataArray,
				skipDuplicates: true,
			})

			// 2. Tạo mảng Jobs cho BullMQ
			const jobs = dataArray.map((item) => ({
				name: JOB_SEND_NOTIFICATION,
				data: {
					...item,
					createdAt: new Date(), // Giả lập thời gian tạo vì createMany ko trả về
				},
				opts: {
					removeOnComplete: true,
					attempts: 3,
				},
			}))

			// 3. Đẩy hàng loạt vào Redis (Cực nhanh)
			await this.notificationQueue.addBulk(jobs)

			this.logger.log(`Queued ${jobs.length} notifications successfully`)
		} catch (error) {
			this.logger.error(`Bulk notification error: ${(error as { message: string }).message}`)
		}
	}

	// ... Giữ nguyên các hàm markAsSeen, markAllAsSeen, delete, findAll ...
	// (Lưu ý: Xóa các helper private publishToAbly, pushToFirebase cũ đi vì đã chuyển sang Processor)

	async markAsSeen(
		id: string,
		userId: string
	): Promise<NotificationResponseDto> {
		const notification = await this.prisma.notification.findFirst({
			where: { id, userId },
		})

		if (!notification) {
			throw new NotFoundException(`Notification not found`)
		}

		const updatedNotification = await this.prisma.notification.update({
			where: { id },
			data: { status: NotificationStatus.SEEN },
		})

		return plainToInstance(NotificationResponseDto, updatedNotification, {
			excludeExtraneousValues: true,
		})
	}

	async markAllAsSeen(userId: string) {
		return this.prisma.notification.updateMany({
			where: { userId, status: NotificationStatus.UNSEEN },
			data: { status: NotificationStatus.SEEN },
		})
	}

	async findAll(userId: string, page: number = 1, limit: number = 10) {
		// ... (Giữ nguyên logic cũ)
		const skip = (page - 1) * limit

		const [notifications, totalCount, unseenCount] = await Promise.all([
			this.prisma.notification.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				skip: skip,
				take: limit,
			}),
			this.prisma.notification.count({ where: { userId } }),
			this.prisma.notification.count({
				where: { userId, status: NotificationStatus.UNSEEN },
			}),
		])

		const totalPages = Math.ceil(totalCount / limit)

		return {
			notifications: plainToInstance(
				NotificationResponseDto,
				notifications,
				{ excludeExtraneousValues: true }
			),
			unseenCount,
			paginate: {
				total: totalCount,
				page: page,
				limit: limit,
				totalPages: totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
		}
	}

	async delete(id: string) {
		return this.prisma.notification.delete({ where: { id } })
	}
}
