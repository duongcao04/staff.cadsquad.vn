import {
	Injectable,
	Logger,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from '@nestjs/common'
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
import { NotificationActionKey } from './dto/notification-action.dto'

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name)

	constructor(
		private readonly prisma: PrismaService,
		@InjectQueue(NOTIFICATION_QUEUE)
		private readonly notificationQueue: Queue
		// TODO: Inject other services here as needed for dynamic actions
		// private readonly jobService: JobService
	) {}

	/**
	 * Send a single notification
	 */
	async send(data: CreateNotificationDto): Promise<NotificationResponseDto> {
		// 1. Save to DB first to ensure data integrity
		// Prisma will automatically handle mapping the JSON actions and metadata fields
		const notification = await this.prisma.notification.create({
			data: data as any,
		})

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
			await this.prisma.notification.createMany({
				data: dataArray as any,
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
					backoff: { type: 'exponential', delay: 1000 },
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
	 * ========================================================================
	 * DYNAMIC ACTIONS SWITCHBOARD
	 * Processes frontend button clicks based on the actionKey & metadata
	 * ========================================================================
	 */
	async executeDynamicAction(
		notificationId: string,
		actionKey: NotificationActionKey,
		userId: string
	) {
		// 1. Fetch notification and verify ownership
		const notification = await this.prisma.notification.findUnique({
			where: { id: notificationId },
		})

		if (!notification) throw new NotFoundException('Notification not found')
		if (notification.userId !== userId)
			throw new ForbiddenException('Access denied')

		// Parse metadata payload (e.g., { relatedJobId: '123' })
		const meta = notification.metadata as Record<string, any> | null

		// 2. Route the action to the appropriate logic
		switch (actionKey) {
			case 'ACCEPT_REVIEW':
				if (!meta?.relatedJobId)
					throw new BadRequestException('Missing job ID in metadata')
				// await this.jobService.acceptReview(meta.relatedJobId, userId)
				this.logger.log(
					`User ${userId} accepted review for Job ${meta.relatedJobId}`
				)
				break

			case 'REJECT_REVIEW':
				if (!meta?.relatedJobId)
					throw new BadRequestException('Missing job ID in metadata')
				// await this.jobService.rejectReview(meta.relatedJobId, userId)
				this.logger.log(
					`User ${userId} rejected review for Job ${meta.relatedJobId}`
				)
				break

			case 'DISMISS_ACTIONS':
				this.logger.log(
					`User ${userId} dismissed actions for notification ${notificationId}`
				)
				break

			default:
				throw new BadRequestException(
					`Unknown action key: ${actionKey}`
				)
		}

		await this.prisma.notification.update({
			where: { id: notificationId },
			data: {
				status: NotificationStatus.SEEN,
				showActions: false,
			},
		})

		return {
			success: true,
			message: `Action ${actionKey} executed successfully`,
		}
	}

	/**
	 * Mark a single notification as seen
	 */
	async markAsSeen(
		id: string,
		userId: string
	): Promise<NotificationResponseDto> {
		// Find FIRST, verify ownership, THEN update. This is the secure way.
		const verify = await this.prisma.notification.findUnique({
			where: { id },
		})

		if (!verify || verify.userId !== userId) {
			throw new NotFoundException(`Notification not found`)
		}

		const updatedNotification = await this.prisma.notification.update({
			where: { id: id },
			data: { status: NotificationStatus.SEEN },
		})

		return plainToInstance(NotificationResponseDto, updatedNotification, {
			excludeExtraneousValues: true,
		})
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
