import { NotificationType } from '@/generated/prisma'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { NotificationService } from '../notification/notification.service'

@Injectable()
export class JobReminderService {
	private readonly logger = new Logger(JobReminderService.name)

	constructor(
		private prisma: PrismaService,
		private notificationService: NotificationService
	) {}

	// Runs every day at 7:00 AM
	@Cron(CronExpression.EVERY_DAY_AT_7AM)
	async handleDeadlineReminders() {
		this.logger.log('CRON: Checking for upcoming job deadlines...')

		const now = new Date()
		const sevenDaysFromNow = new Date()
		sevenDaysFromNow.setDate(now.getDate() + 7)

		// 1. Find jobs due soon that are not TERMINATED or COMPLETED
		const upcomingJobs = await this.prisma.job.findMany({
			where: {
				dueAt: {
					gt: now,
					lte: sevenDaysFromNow,
				},
				deletedAt: null,
				// Only remind for jobs that aren't already finished
				status: {
					systemType: {
						notIn: ['COMPLETED', 'TERMINATED'],
					},
				},
			},
			include: {
				assignments: true,
				status: true,
			},
		})

		if (upcomingJobs.length === 0) {
			this.logger.log('CRON: No upcoming deadlines found.')
			return
		}

		// 2. Process Notifications
		for (const job of upcomingJobs) {
			const diffTime = job.dueAt.getTime() - now.getTime()
			const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

			if (job.assignments.length === 0) continue

			try {
				// Use your NotificationService.sendMany for efficiency
				await this.notificationService.sendMany(
					job.assignments.map((assignment) => ({
						userId: assignment.userId,
						// No senderId needed as this is a SYSTEM notification
						title: `Upcoming Deadline: ${job.no}`,
						content: `Job "${job.displayName}" is due in ${daysLeft} days (${job.dueAt.toLocaleDateString('en-GB')}).`,
						type: NotificationType.JOB_DEADLINE_REMINDER,
						redirectUrl: `/jobs/${job.no}`,
					}))
				)

				this.logger.debug(`Reminders dispatched for Job #${job.no}`)
			} catch (error) {
				this.logger.error(
					`Failed to send reminders for Job ${job.no}:`,
					error
				)
			}
		}

		this.logger.log(
			`CRON: Successfully processed reminders for ${upcomingJobs.length} jobs.`
		)
	}
}
