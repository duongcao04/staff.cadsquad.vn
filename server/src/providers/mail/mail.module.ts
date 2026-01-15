import { mailConfig } from '@/config'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { Module } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { join } from 'path'
import { EmailController } from './email.controller'
import { MailService } from './mail.service'

@Module({
	imports: [
		MailerModule.forRootAsync({
			// 👇 1. Inject Config
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
					dir: join(process.cwd(), '/src/templates'),

					adapter: new HandlebarsAdapter({
						eq: (a: any, b: any) => a === b,
					}),
					options: {
						strict: true,
					},
				},
			}),
		}),
	],
	controllers: [EmailController],
	providers: [MailService],
	exports: [MailService],
})
export class MailModule {}
