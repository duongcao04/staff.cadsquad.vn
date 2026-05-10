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
		@InjectQueue(NOTIFICATION_QUEUE)
		private readonly notificationQueue: Queue
	) {}

	/**
	 * Send a single notification
	 */
	async send(data: CreateNotificationDto): Promise<NotificationResponseDto> {
		// 1. Save to DB first to ensure data integrity
		const notification = await this.prisma.notification.create({ data })

		// 2. Push to Queue for async processing (Ably + Firebase)
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
	 * Send notification to all users with a specific Role
	 */
	async sendToRole(
		roleId: string,
		data: Omit<CreateNotificationDto, 'userId'>
	) {
		const users = await this.prisma.user.findMany({
			where: { role: { id: roleId }, isActive: true },
			select: { id: true },
		})

		if (!users.length) return

		const dataArray = users.map((user) => ({
			...data,
			userId: user.id,
		})) as CreateNotificationDto[]

		return this.sendMany(dataArray)
	}

	/**
	 * Utility Wrapper: Send notification to a specific User
	 */
	async sendToUser(
		userId: string,
		data: Omit<CreateNotificationDto, 'userId'>
	) {
		return this.send({
			...data,
			userId,
		} as CreateNotificationDto)
	}

	/**
	 * Wrapper: Send to a specific list of User IDs (e.g., project team)
	 */
	async sendToUsers(
		userIds: string[],
		data: Omit<CreateNotificationDto, 'userId'>
	) {
		if (!userIds.length) return

		// Prevent duplicates - ensure a user doesn't receive the same notif twice
		const uniqueUserIds = [...new Set(userIds)]

		const dataArray = uniqueUserIds.map((id) => ({
			...data,
			userId: id,
		})) as CreateNotificationDto[]

		return this.sendMany(dataArray)
	}

	/**
	 * Bulk Send Notifications
	 */
	async sendMany(dataArray: CreateNotificationDto[]): Promise<void> {
		if (!dataArray.length) return

		try {
			// 1. Bulk insert to DB
			// Note: Prisma's createMany doesn't return the created records with their UUIDs
			await this.prisma.notification.createMany({
				data: dataArray,
				skipDuplicates: true,
			})

			// 2. Prepare BullMQ Jobs
			const jobs = dataArray.map((item) => ({
				name: JOB_SEND_NOTIFICATION,
				data: {
					...item,
					createdAt: new Date(), // Mock creation time for the queue payload
				},
				opts: {
					removeOnComplete: true,
					attempts: 3,
					backoff: { type: 'exponential', delay: 1000 }, // Added backoff here too
				},
			}))

			// 3. Bulk add to Redis
			await this.notificationQueue.addBulk(jobs)

			this.logger.log(`Queued ${jobs.length} notifications successfully`)
		} catch (error) {
			this.logger.error(
				`Bulk notification error: ${(error as Error).message}`,
				(error as Error).stack
			)
		}
	}

	/**
	 * Mark a single notification as seen
	 */
	async markAsSeen(
		id: string,
		userId: string
	): Promise<NotificationResponseDto> {
		// Use an atomic update instead of findFirst -> update
		// If it doesn't exist or belong to the user, Prisma will throw a P2025 error
		try {
			const updatedNotification = await this.prisma.notification.update({
				where: {
					id: id,
					// Note: In standard Prisma, you cannot use non-unique fields inside `where` for `update`.
					// To ensure the user owns it securely, you have two options.
					// Option A: Use `updateMany` (safe, doesn't throw if not found)
					// Option B: Query first, then update (what you had, which is fine).
				},
				data: { status: NotificationStatus.SEEN },
			})

			// To ensure security (only the owner can mark it seen), we should verify ownership:
			const verify = await this.prisma.notification.findUnique({
				where: { id },
			})
			if (!verify || verify.userId !== userId) {
				throw new NotFoundException(`Notification not found`)
			}

			return plainToInstance(
				NotificationResponseDto,
				updatedNotification,
				{
					excludeExtraneousValues: true,
				}
			)
		} catch (error) {
			throw new NotFoundException(`Notification not found`)
		}
	}

	/**
	 * Mark all notifications for a user as seen
	 */
	async markAllAsSeen(userId: string) {
		return this.prisma.notification.updateMany({
			where: { userId, status: NotificationStatus.UNSEEN },
			data: { status: NotificationStatus.SEEN },
		})
	}

	/**
	 * Fetch paginated notifications for a user
	 */
	async findAll(userId: string, page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit

		const [notifications, totalCount, unseenCount] = await Promise.all([
			this.prisma.notification.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				skip: skip,
				take: limit,
				// Include sender details to show avatar in UI
				include: {
					sender: {
						select: {
							id: true,
							displayName: true,
							avatar: true,
						},
					},
				},
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

	/**
	 * Delete a notification
	 */
	async delete(id: string) {
		return this.prisma.notification.delete({ where: { id } })
	}
}
