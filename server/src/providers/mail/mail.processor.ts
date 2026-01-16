import { appConfig } from '@/config'
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { Job } from 'bullmq'
import { SendEmailOptions } from './interfaces/mail.interface'
import {
	JOB_SEND_ACCOUNT_STATUS,
	JOB_SEND_EMAIL,
	JOB_SEND_INVITATION_EMAIL,
	JOB_SEND_JOB_ASSIGNMENT,
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
				// --- Các Job Cũ ---
				case JOB_SEND_EMAIL:
					return await this.handleGenericEmail(job.data)

				case JOB_SEND_INVITATION_EMAIL:
					return await this.handleInvitationEmail(job.data)

				// --- Các Job Mới (Logic chuyển từ Service sang) ---

				case JOB_SEND_JOB_ASSIGNMENT:
					return await this.handleJobAssignment(job.data)

				case JOB_SEND_ACCOUNT_STATUS:
					return await this.handleAccountStatus(job.data)

				case JOB_SEND_RESET_PASSWORD:
					return await this.handleResetPassword(job.data)

				default:
					throw new Error(`Unknown job name: ${job.name}`)
			}
		} catch (error) {
			this.logger.error(`❌ Job ${job.name} failed`, error.stack)
			throw error // Ném lỗi để BullMQ retry
		}
	}

	// ================= LOGIC GỬI MAIL CHI TIẾT =================

	// 1. Job Assignment
	private async handleJobAssignment(data: any) {
		await this.mailerService.sendMail({
			to: data.email,
			subject: `[CAD SQUAD] Bạn có nhiệm vụ mới: ${data.jobNo}`,
			template: './job-assignment',
			context: {
				name: data.displayName,
				jobNo: data.jobNo,
				jobTitle: data.jobTitle,
				url: `${this.config.CLIENT_URL}/jobs/${data.jobNo}`,
			},
		})
		return { sent: true, to: data.email }
	}

	// 2. Account Status
	private async handleAccountStatus(data: any) {
		await this.mailerService.sendMail({
			to: data.email,
			subject: `[CAD SQUAD] Cập nhật trạng thái tài khoản: ${data.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}`,
			template: './account-status',
			context: {
				name: data.displayName,
				status: data.isActive ? 'Active' : 'Inactive',
			},
		})
		return { sent: true, to: data.email }
	}

	// 3. Reset Password
	private async handleResetPassword(data: any) {
		await this.mailerService.sendMail({
			to: data.email,
			subject: `[CAD SQUAD] Reset your password`,
			template: './reset-password-email',
			context: {
				name: data.displayName || 'User',
				link: `${this.config.CLIENT_URL}/auth/reset-password?token=${data.token}`,
			},
		})
		return { sent: true, to: data.email }
	}

	// 4. Invitation (Logic cũ của bạn, chuẩn hóa lại)
	private async handleInvitationEmail(data: {
		email: string
		personalEmail?: string
		displayName: string
		password: string
	}) {
		console.log(data)

		await this.mailerService
			.sendMail({
				to: data.email,
				cc: data.personalEmail,
				subject:
					'[CADSQUAD] Welcome to CAD SQUAD - Your Account is Ready',
				template: './user-invitation',
				context: {
					displayName: data.displayName,
					email: data.email,
					password: data.password,
					url: `${this.config.CLIENT_URL}/login`, // Lấy URL từ config
				},
			})
			.then(() => {
				this.logger.log(
					`Invitation email successfully sent to: ${data.email}`
				)
			})
		return { sent: true, to: data.email }
	}

	// 5. Generic Email (Giữ nguyên hoặc dùng sendEmail chung)
	private async handleGenericEmail(options: SendEmailOptions) {
		const {
			to,
			subject,
			content,
			fromName,
			fromEmail,
			cc,
			bcc,
			attachments,
		} = options
		try {
			const mailOptions: ISendMailOptions = {
				to,
				cc,
				bcc,
				subject,
				html: content,
				attachments, // Array of { filename, path/content }
			}

			await this.mailerService.sendMail(mailOptions).then(() => {
				this.logger.log(
					`Email successfully sent to: ${Array.isArray(to) ? to.join(', ') : to}`
				)
			})
			return { sent: true, to: mailOptions.to }
		} catch (error) {
			this.logger.error(
				`Failed to send email to ${to}: ${error.message}`,
				error.stack
			)
			throw error // Re-throw if you want the calling service to handle the error
		}
	}
}
