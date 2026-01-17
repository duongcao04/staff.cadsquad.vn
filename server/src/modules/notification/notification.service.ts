import { NotificationStatus, NotificationType } from '@/generated/prisma'
import { FirebaseService } from '@/providers/firebase/firebase.service'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import * as admin from 'firebase-admin'
import { AblyService } from '../ably/ably.service'
import { CreateNotificationDto } from './dto/create-notification.dto'
import { NotificationResponseDto } from './dto/notification-response.dto'

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name)

	constructor(
		@Inject('FIREBASE_ADMIN') private readonly firebase: admin.app.App,
		private readonly prisma: PrismaService,
		private readonly ablyService: AblyService,
		private readonly firebaseService: FirebaseService
	) {}

	/**
	 * Gửi thông báo đến 1 User cụ thể (Lưu DB + Ably + Firebase)
	 */
	async send(data: CreateNotificationDto): Promise<NotificationResponseDto> {
		const notification = await this.prisma.notification.create({ data })

		// 1. Realtime (Ably)
		await this.publishToAbly(notification)

		// 3. Push qua Firebase (Web đã đóng hoặc Mobile)
		await this.firebaseService.sendToUser(notification.userId, {
			title: notification.title ?? 'CADSQUAD System',
			body: notification.content,
			url: notification.redirectUrl ?? undefined,
		})

		return plainToInstance(NotificationResponseDto, notification, {
			excludeExtraneousValues: true,
		})
	}

	/**
	 * Gửi thông báo cho toàn bộ User thuộc một Role (Ví dụ: Tất cả ADMIN)
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
	 * Gửi hàng loạt thông báo hiệu năng cao
	 */
	async sendMany(dataArray: CreateNotificationDto[]): Promise<void> {
		if (!dataArray.length) return

		try {
			// Lưu DB một lần duy nhất
			await this.prisma.notification.createMany({
				data: dataArray,
				skipDuplicates: true,
			})

			// Gửi các kênh truyền thông song song
			const tasks = dataArray.map(async (item) => {
				await this.publishToAbly(item)
				await this.firebaseService.sendToUser(item.userId, {
					title: item.title ?? 'CADSQUAD System',
					body: item.content,
					url: item.redirectUrl,
				})
			})

			await Promise.all(tasks)
		} catch (error) {
			this.logger.error(`Bulk notification error: ${error.message}`)
		}
	}

	/**
	 * Đánh dấu một thông báo cụ thể là đã xem
	 * @param id ID của thông báo
	 * @param userId ID của người dùng (để đảm bảo tính bảo mật, tránh user này markSeen cho user khác)
	 */
	async markAsSeen(
		id: string,
		userId: string
	): Promise<NotificationResponseDto> {
		// 1. Kiểm tra sự tồn tại và quyền sở hữu
		const notification = await this.prisma.notification.findFirst({
			where: { id, userId },
		})

		if (!notification) {
			throw new NotFoundException(
				`Notification with ID ${id} not found for this user`
			)
		}

		// 2. Cập nhật trạng thái
		const updatedNotification = await this.prisma.notification.update({
			where: { id },
			data: { status: NotificationStatus.SEEN },
		})

		// 3. Trả về DTO chuẩn
		return plainToInstance(NotificationResponseDto, updatedNotification, {
			excludeExtraneousValues: true,
		})
	}

	/**
	 * Helper: Bắn tín hiệu Ably
	 */
	private async publishToAbly(item: any) {
		try {
			await this.ablyService.publish(
				`user-notifications:${item.userId}`,
				item.type || NotificationType.INFO,
				{ ...item, createdAt: item.createdAt || new Date() }
			)
		} catch (e) {
			this.logger.warn(`Ably publish failed for ${item.userId}`)
		}
	}

	/**
	 * Helper: Gửi Push Firebase & Tự dọn dẹp token cũ
	 */
	private async pushToFirebase(
		userId: string,
		payload: { title: string; body: string; url?: string }
	) {
		const devices = await this.prisma.userDevices.findMany({
			where: { userId, status: true },
			select: { value: true },
		})

		const tokens = devices.map((d) => d.value)
		if (tokens.length === 0) return

		const message: admin.messaging.MulticastMessage = {
			tokens,
			notification: { title: payload.title, body: payload.body },
			data: { redirectUrl: payload.url || '/' },
		}

		const response = await this.firebase
			.messaging()
			.sendEachForMulticast(message)

		// Xử lý token lỗi/hết hạn
		const tokensToDeactivate = response.responses
			.map((resp, idx) => {
				if (!resp.success) {
					const code = resp.error?.code
					if (
						code ===
							'messaging/registration-token-not-registered' ||
						code === 'messaging/invalid-registration-token'
					) {
						return tokens[idx]
					}
				}
				return null
			})
			.filter((t): t is string => t !== null)

		if (tokensToDeactivate.length > 0) {
			await this.prisma.userDevices.updateMany({
				where: { value: { in: tokensToDeactivate } },
				data: { status: false },
			})
		}
	}
	async findAll(userId: string, page: number = 1, limit: number = 10) {
		// 1. Tính toán số bản ghi cần bỏ qua
		const skip = (page - 1) * limit

		// 2. Chạy song song các query để tối ưu hiệu năng
		const [notifications, totalCount, unseenCount] = await Promise.all([
			this.prisma.notification.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				skip: skip,
				take: limit, // Số lượng bản ghi trên một trang
			}),
			this.prisma.notification.count({ where: { userId } }),
			this.prisma.notification.count({
				where: { userId, status: NotificationStatus.UNSEEN },
			}),
		])

		// 3. Tính toán thông tin phân trang (Metadata)
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

	/**
	 * Đánh dấu tất cả thông báo của một người dùng là đã xem
	 * @param userId ID của người dùng thực hiện hành động
	 */
	async markAllAsSeen(userId: string): Promise<{ count: number }> {
		// Cập nhật tất cả các bản ghi có status UNSEEN của user này
		const result = await this.prisma.notification.updateMany({
			where: {
				userId: userId,
				status: NotificationStatus.UNSEEN,
			},
			data: {
				status: NotificationStatus.SEEN,
			},
		})

		this.logger.log(
			`User ${userId} marked ${result.count} notifications as seen`
		)

		return result // Trả về số lượng bản ghi đã được cập nhật
	}

	async delete(id: string) {
		return this.prisma.notification.delete({ where: { id } })
	}
}
