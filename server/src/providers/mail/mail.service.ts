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
} from './mail.constants'

@Injectable()
export class MailService implements OnModuleInit {
	private readonly logger = new Logger(MailService.name)

	constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

	// 2. Tự động Resume khi module khởi chạy
	async onModuleInit() {
		const isPaused = await this.mailQueue.isPaused()
		if (isPaused) {
			await this.mailQueue.resume()
			console.log('▶️ MailQueue was paused. Resumed automatically!')
		}
	}
	/**
	 * 1. Thông báo giao việc -> Đẩy vào Queue
	 */
	async sendJobAssignmentNotification(
		user: User,
		jobNo: string,
		jobTitle: string
	) {
		await this.mailQueue.add(JOB_SEND_JOB_ASSIGNMENT, {
			email: user.email,
			displayName: user.displayName,
			jobNo,
			jobTitle,
		})
		this.logger.log(`📥 Queued job assignment for: ${user.email}`)
	}

	/**
	 * 2. Thông báo trạng thái tài khoản -> Đẩy vào Queue
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
	 * 3. Reset Password -> Đẩy vào Queue
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
	 * 4. User Invitation -> Đẩy vào Queue
	 */
	async sendUserInvitation(
		email: string,
		displayName: string,
		password: string
	) {
		await this.mailQueue.add(JOB_SEND_INVITATION_EMAIL, {
			email,
			displayName,
			password,
		})
		return true
	}

	/**
	 * 5. Generic Send Email -> Đẩy vào Queue
	 */
	async sendEmail(options: SendEmailOptions): Promise<boolean> {
		await this.mailQueue.add(JOB_SEND_EMAIL, options, {
			attempts: 3,
			backoff: { type: 'exponential', delay: 2000 },
			removeOnComplete: true,
		})
		return true
	}
}
