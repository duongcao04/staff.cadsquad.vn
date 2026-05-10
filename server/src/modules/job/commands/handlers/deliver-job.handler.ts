import { ActivityType, JobStatusSystemType } from '@/generated/prisma'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DeliverJobCommand } from '../impl/deliver-job.command'
import { NotificationService } from '../../../notification/notification.service'

@CommandHandler(DeliverJobCommand)
export class DeliverJobHandler implements ICommandHandler<DeliverJobCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationService: NotificationService
	) {}

	async execute(command: DeliverJobCommand) {
		const { dto, jobId, userId } = command
		// 1. Verify the job exists
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				reviewers: {
					select: {
						id: true,
					},
				},
			},
		})

		if (!job) {
			throw new NotFoundException('Job not found')
		}

		// 2. Get the "DELIVERED" status ID to update the job
		// Based on your schema's JobStatusSystemType enum
		const deliveredStatus = await this.prisma.jobStatus.findFirst({
			where: { systemType: JobStatusSystemType.DELIVERED },
		})

		if (!deliveredStatus) {
			throw new BadRequestException(
				'System status "DELIVERED" is not configured in the database.'
			)
		}

		await this.prisma.$transaction(async (tx) => {
			const delivery = await tx.jobDelivery.create({
				data: {
					jobId,
					userId,
					note: dto.note,
					link: dto.link,
					files: {
						create:
							dto.files?.map((file) => ({
								fileName: file.fileName,
								webUrl: file.webUrl,
								sharepointId: file.sharepointId,
							})) || [],
					},
				},
				include: {
					files: true,
				},
			})

			// B. Update the Job's status
			await tx.job.update({
				where: { id: jobId },
				data: {
					statusId: deliveredStatus.id,
				},
			})

			// C. Close the previous JobStatusHistory and start a new one
			const currentHistory = await tx.jobStatusHistory.findFirst({
				where: { jobId, endedAt: null },
				orderBy: { startedAt: 'desc' },
			})

			if (currentHistory) {
				await tx.jobStatusHistory.update({
					where: { id: currentHistory.id },
					data: {
						endedAt: new Date(),
						durationSeconds: Math.floor(
							(new Date().getTime() -
								currentHistory.startedAt.getTime()) /
								1000
						),
					},
				})
			}

			// Create new history record for DELIVERED status
			await tx.jobStatusHistory.create({
				data: {
					jobId,
					statusId: deliveredStatus.id,
					changedById: userId,
				},
			})

			// D. Log the activity
			await tx.jobActivityLog.create({
				data: {
					jobId,
					modifiedById: userId,
					activityType: ActivityType.DELIVER,
					fieldName: 'Status',
					currentValue: `Delivered: ${dto.note}`,
					notes: 'Job delivered for review',
				},
			})

			return delivery
		})

		const notifyToUsers = job.reviewers.map((it) => it.id)
		console.log(notifyToUsers)

		if (!notifyToUsers || notifyToUsers.length === 0) {
			const creatorId = job.createdById
			await this.notificationService.sendToUser(creatorId, {
				senderId: userId,
				type: 'JOB_DELIVERED',
				content: `Job #${job.no} has been delivered.`,
				redirectUrl: `/jobs/${job.id}`,
			})
		} else {
			await this.notificationService.sendToUsers(notifyToUsers, {
				senderId: userId,
				type: 'JOB_DELIVERED',
				content: `Job #${job.no} has been delivered.`,
				redirectUrl: `/jobs/${job.id}`,
			})
		}
	}
}
