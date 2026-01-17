import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'
import { User } from '@/generated/prisma'
import { SendEmailOptions } from './interfaces/mail.interface'
import {
	MAIL_QUEUE,
	JOB_SEND_EMAIL,
	JOB_SEND_INVITATION_EMAIL,
	JOB_SEND_JOB_ASSIGNMENT,
	JOB_SEND_ACCOUNT_STATUS,
	JOB_SEND_RESET_PASSWORD,
	JOB_SEND_JOB_PAID,
	JOB_SEND_REJECT_MAIL,
	JOB_SEND_APPROVE_MAIL,
	JOB_SEND_DELIVER_MAIL,
	JOB_SEND_FORCE_STATUS_UPDATE,
} from './mail.constants'

@Injectable()
export class MailService implements OnModuleInit {
	private readonly logger = new Logger(MailService.name)

	constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

	async onModuleInit() {
		const isPaused = await this.mailQueue.isPaused()
		if (isPaused) {
			await this.mailQueue.resume()
			this.logger.log('▶️ MailQueue was paused. Resumed automatically!')
		}
	}

	/**
	 * 1. Job Assignment Notification
	 */
	async sendJobAssignmentNotification(
		users: { email: string; personalEmail?: string; displayName: string }[],
		job: {
			no: string
			displayName: string
			clientName?: string
			dueAt: Date
		}
	) {
		const queueJobs = users.map((user) =>
			this.mailQueue.add(JOB_SEND_JOB_ASSIGNMENT, {
				email: user.email,
				cc: user.personalEmail || user.email,
				username: user.displayName,
				jobNo: job.no,
				jobTitle: job.displayName,
				clientName: job.clientName || 'N/A',
				dueAt: job.dueAt,
			})
		)
		await Promise.all(queueJobs)
		this.logger.log(`Queued job assignment for ${users.length} users.`)
	}

	/**
	 * 2. Account Status
	 */
	async sendAccountStatusUpdate(
		user: Pick<User, 'email' | 'displayName' | 'isActive'>
	) {
		await this.mailQueue.add(JOB_SEND_ACCOUNT_STATUS, {
			email: user.email,
			displayName: user.displayName,
			isActive: user.isActive,
		})
		this.logger.log(`📥 Queued account status for: ${user.email}`)
	}

	/**
	 * 3. Job Paid Notification
	 */
	async sendJobPaidNotification(
		users: { email: string; personalEmail?: string; displayName: string }[],
		job: {
			no: string
			displayName: string
			incomeCost: number
			paidAt?: Date
		}
	) {
		const queueJobs = users.map((user) =>
			this.mailQueue.add(JOB_SEND_JOB_PAID, {
				email: user.email,
				cc: user.personalEmail,
				username: user.displayName,
				jobNo: job.no,
				jobTitle: job.displayName,
				amount: job.incomeCost,
				paidAt: job.paidAt || new Date(),
			})
		)
		await Promise.all(queueJobs)
		this.logger.log(
			`💸 Queued job PAID notification for ${users.length} users.`
		)
	}

	/**
	 * 4. Reset Password
	 */
	async sendResetPasswordEmail(
		email: string,
		token: string,
		displayName: string
	) {
		await this.mailQueue.add(JOB_SEND_RESET_PASSWORD, {
			email,
			token,
			displayName,
		})
		this.logger.log(`📥 Queued reset password for: ${email}`)
	}

	/**
	 * 5. User Invitation
	 */
	async sendUserInvitation(
		email: string,
		displayName: string,
		password: string,
		personalEmail?: string
	) {
		await this.mailQueue.add(JOB_SEND_INVITATION_EMAIL, {
			email,
			personalEmail,
			displayName,
			password,
		})
		return true
	}

	/**
	 * 6. Generic Send Email
	 */
	async sendEmail(options: SendEmailOptions): Promise<boolean> {
		await this.mailQueue.add(JOB_SEND_EMAIL, options, {
			attempts: 3,
			backoff: { type: 'exponential', delay: 2000 },
			removeOnComplete: true,
		})
		return true
	}

	// ------------------------------------------------------------
	// WORKFLOW NOTIFICATIONS
	// ------------------------------------------------------------

	/**
	 * 7. Job Delivered
	 */
	async sendJobDeliveredNotification(
		users: { email: string; personalEmail?: string; displayName: string }[],
		job: { no: string; displayName: string }
	) {
		const queueJobs = users.map((user) =>
			this.mailQueue.add(JOB_SEND_DELIVER_MAIL, {
				email: user.email,
				cc: user.personalEmail,
				username: user.displayName,
				jobNo: job.no,
				jobTitle: job.displayName,
			})
		)
		await Promise.all(queueJobs)
		this.logger.log(
			`🚀 Queued DELIVERED notification for ${users.length} users.`
		)
	}

	/**
	 * 8. Job Approved
	 */
	async sendJobApprovedNotification(
		users: { email: string; personalEmail?: string; displayName: string }[],
		job: { no: string; displayName: string }
	) {
		const queueJobs = users.map((user) =>
			this.mailQueue.add(JOB_SEND_APPROVE_MAIL, {
				email: user.email,
				cc: user.personalEmail,
				username: user.displayName,
				jobNo: job.no,
				jobTitle: job.displayName,
			})
		)
		await Promise.all(queueJobs)
		this.logger.log(
			`✅ Queued APPROVED notification for ${users.length} users.`
		)
	}

	/**
	 * 9. Job Rejected
	 */
	async sendJobRejectedNotification(
		users: { email: string; personalEmail?: string; displayName: string }[],
		job: { no: string; displayName: string },
		reason: string
	) {
		const queueJobs = users.map((user) =>
			this.mailQueue.add(JOB_SEND_REJECT_MAIL, {
				email: user.email,
				cc: user.personalEmail,
				username: user.displayName,
				jobNo: job.no,
				jobTitle: job.displayName,
				reason: reason || 'No reason provided',
			})
		)
		await Promise.all(queueJobs)
		this.logger.log(
			`⚠️ Queued REJECTED notification for ${users.length} users.`
		)
	}
	/**
	 * 10. Force Status Update Notification
	 */
	async sendForceStatusUpdateNotification(
		users: { email: string; personalEmail?: string; displayName: string }[],
		data: {
			jobNo: string
			jobTitle: string
			oldStatus: string
			newStatus: string
			modifierName: string
		}
	) {
		const queueJobs = users.map((user) =>
			this.mailQueue.add(JOB_SEND_FORCE_STATUS_UPDATE, {
				email: user.email,
				cc: user.personalEmail,
				username: user.displayName,
				// Job Details
				jobNo: data.jobNo,
				jobTitle: data.jobTitle,
				oldStatus: data.oldStatus,
				newStatus: data.newStatus,
				modifierName: data.modifierName,
			})
		)

		await Promise.all(queueJobs)
		this.logger.log(
			`🔄 Queued FORCE STATUS UPDATE email for ${users.length} users.`
		)
	}
}
