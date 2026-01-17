import { appConfig } from '@/config'
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { Job } from 'bullmq'
import { IMAGES } from '../../utils'
import { SendEmailOptions } from './interfaces/mail.interface'
import {
	JOB_SEND_ACCOUNT_STATUS,
	JOB_SEND_APPROVE_MAIL,
	JOB_SEND_DELIVER_MAIL,
	JOB_SEND_EMAIL,
	JOB_SEND_INVITATION_EMAIL,
	JOB_SEND_JOB_ASSIGNMENT,
	JOB_SEND_JOB_PAID,
	JOB_SEND_REJECT_MAIL,
	JOB_SEND_RESET_PASSWORD,
	MAIL_QUEUE,
} from './mail.constants'

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
	private readonly logger = new Logger(MailProcessor.name)

	constructor(
		@Inject(appConfig.KEY)
		private readonly config: ConfigType<typeof appConfig>,
		private readonly mailerService: MailerService
	) {
		super()
	}

	async process(job: Job<any>): Promise<any> {
		this.logger.log(`⚙️ Processing job: ${job.name} (ID: ${job.id})`)

		try {
			switch (job.name) {
				// Generic
				case JOB_SEND_EMAIL:
					return await this.handleGenericEmail(job.data)

				// Auth & Account
				case JOB_SEND_INVITATION_EMAIL:
					return await this.handleInvitationEmail(job.data)
				case JOB_SEND_ACCOUNT_STATUS:
					return await this.handleAccountStatus(job.data)
				case JOB_SEND_RESET_PASSWORD:
					return await this.handleResetPassword(job.data)

				// Job Workflow
				case JOB_SEND_JOB_ASSIGNMENT:
					return await this.handleJobAssignment(job.data)
				case JOB_SEND_JOB_PAID:
					return await this.handleJobPaid(job.data)
				case JOB_SEND_DELIVER_MAIL:
					return await this.handleJobDelivered(job.data)
				case JOB_SEND_APPROVE_MAIL:
					return await this.handleJobApproved(job.data)
				case JOB_SEND_REJECT_MAIL:
					return await this.handleJobRejected(job.data)

				default:
					throw new Error(`Unknown job name: ${job.name}`)
			}
		} catch (error) {
			this.logger.error(
				`❌ Job ${job.name} failed: ${error.message}`,
				error.stack
			)
			throw error // Throw to trigger BullMQ retry mechanism
		}
	}

	// ================= HANDLERS =================

	private async handleJobAssignment(data: any) {
		await this.sendMail(
			data.email,
			data.cc,
			`[CAD SQUAD] New Job Assignment: ${data.jobNo}`,
			'./job-assignment',
			{
				recipientName: data.username,
				jobNo: data.jobNo,
				jobTitle: data.jobTitle,
				clientName: data.clientName,
				dueDate: data.dueAt
					? new Date(data.dueAt).toLocaleDateString('vi-VN')
					: 'TBD',
				jobLink: `${this.config.CLIENT_URL}/jobs/${data.jobNo}`,
				logoUrl: IMAGES.NOTIFICATION_DEFAULT_IMAGE,
				settingsLink: `${this.config.CLIENT_URL}/settings/my-profile`,
			}
		)
	}

	private async handleAccountStatus(data: any) {
		await this.sendMail(
			data.email,
			null,
			`[CAD SQUAD] Account Status Update`,
			'./account-status',
			{
				name: data.displayName,
				status: data.isActive ? 'Active' : 'Inactive',
			}
		)
	}

	private async handleJobPaid(data: any) {
		await this.sendMail(
			data.email,
			data.cc,
			`[CAD SQUAD] Payment Received: ${data.jobNo}`,
			'./job-paid',
			{
				recipientName: data.username,
				jobNo: data.jobNo,
				jobTitle: data.jobTitle,
				amountFormatted: new Intl.NumberFormat('vi-VN', {
					style: 'currency',
					currency: 'VND',
				}).format(data.amount),
				paidDate: new Date(data.paidAt).toLocaleDateString('vi-VN'),
				jobLink: `${this.config.CLIENT_URL}/jobs/${data.jobNo}`,
				logoUrl: IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			}
		)
	}

	private async handleResetPassword(data: any) {
		await this.sendMail(
			data.email,
			null,
			`[CAD SQUAD] Reset your password`,
			'./reset-password-email',
			{
				name: data.displayName || 'User',
				link: `${this.config.CLIENT_URL}/auth/reset-password?token=${data.token}`,
			}
		)
	}

	private async handleInvitationEmail(data: any) {
		await this.sendMail(
			data.email,
			data.personalEmail,
			`[CAD SQUAD] Welcome - Your Account is Ready`,
			'./user-invitation',
			{
				displayName: data.displayName,
				email: data.email,
				password: data.password,
				url: `${this.config.CLIENT_URL}/login`,
			}
		)
	}

	// --- WORKFLOW HANDLERS (Fixed Logic) ---

	// Note: 'data' is the object passed from Service ({ email, jobNo... }), NOT an array.
	private async handleJobDelivered(data: any) {
		await this.sendMail(
			data.email,
			data.cc,
			`[CAD SQUAD] Job Delivered: ${data.jobNo}`,
			'./job-delivered',
			{
				recipientName: data.username,
				jobNo: data.jobNo,
				jobTitle: data.jobTitle,
				jobLink: `${this.config.CLIENT_URL}/jobs/${data.jobNo}`,
				logoUrl: IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			}
		)
	}

	private async handleJobApproved(data: any) {
		await this.sendMail(
			data.email,
			data.cc,
			`[CAD SQUAD] Job Approved: ${data.jobNo} ✅`,
			'./job-approved',
			{
				recipientName: data.username,
				jobNo: data.jobNo,
				jobTitle: data.jobTitle,
				jobLink: `${this.config.CLIENT_URL}/jobs/${data.jobNo}`,
				logoUrl: IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			}
		)
	}

	private async handleJobRejected(data: any) {
		await this.sendMail(
			data.email,
			data.cc,
			`[CAD SQUAD] Revision Requested: ${data.jobNo} ⚠️`,
			'./job-rejected',
			{
				recipientName: data.username,
				jobNo: data.jobNo,
				jobTitle: data.jobTitle,
				rejectionReason: data.reason,
				jobLink: `${this.config.CLIENT_URL}/jobs/${data.jobNo}`,
				logoUrl: IMAGES.NOTIFICATION_DEFAULT_IMAGE,
			}
		)
	}

	private async handleGenericEmail(options: SendEmailOptions) {
		// Generic implementation direct call
		await this.mailerService.sendMail({
			to: options.to,
			cc: options.cc,
			bcc: options.bcc,
			subject: options.subject,
			html: options.content,
			attachments: options.attachments,
		})
		this.logger.log(`Generic email sent to ${options.to}`)
	}

	// Helper to reduce boilerplate
	private async sendMail(
		to: string,
		cc: string | null,
		subject: string,
		template: string,
		context: any
	) {
		await this.mailerService.sendMail({
			to,
			cc: cc || undefined, // undefined if null
			subject,
			template,
			context: {
				...context,
				currentYear: new Date().getFullYear(), // Global context
			},
		})
		this.logger.log(`📧 Email '${template}' sent to: ${to}`)
		return { sent: true, to }
	}
}
