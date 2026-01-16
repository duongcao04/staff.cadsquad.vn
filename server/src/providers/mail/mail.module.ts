import { mailConfig } from '@/config'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { Module } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { join } from 'path'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { EmailController } from './email.controller'
import { MailService } from './mail.service'
import { BullModule } from '@nestjs/bullmq'
import { MAIL_QUEUE } from './mail.constants'
import { MailProcessor } from './mail.processor'

@Module({
	imports: [
		MailerModule.forRootAsync({
			// 1. Inject Config
			inject: [mailConfig.KEY],
			useFactory: async (config: ConfigType<typeof mailConfig>) => ({
				transport: {
					host: config.MAIL_HOST,
					port: config.MAIL_PORT,
					secure: config.MAILER_SECURE, // true cho port 465, false cho các port khác
					auth: {
						user: config.MAIL_USER,
						pass: config.MAIL_PASS,
					},
				},
				defaults: {
					// Sử dụng config.from hoặc fallback về user
					from: `"${config.MAIL_FROM}" <${config.MAIL_USER}>`,
				},
				template: {
					dir: join(process.cwd(), config.MAIL_TEMPLATE_PATH),

					adapter: new HandlebarsAdapter({
						eq: (a: any, b: any) => a === b,
					}),
					options: {
						strict: true,
					},
				},
			}),
		}),
		BullModule.registerQueue({
			name: MAIL_QUEUE,
		}),
		BullBoardModule.forFeature({
			name: MAIL_QUEUE, // Tên phải trùng khớp với registerQueue ở trên
			adapter: BullMQAdapter, // Bắt buộc dùng BullMQAdapter
		}),
	],
	controllers: [EmailController],
	providers: [MailService, MailProcessor],
	exports: [MailService],
})
export class MailModule {}
