import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import {
	ablyConfig,
	appConfig,
	authConfig,
	azureConfig,
	bullConfig,
	cloudinaryConfig,
	databaseConfig,
	firebaseConfig,
	mailConfig,
} from '@/config'
import { AblyModule } from '@/modules/ably/ably.module'
import { AnalyticsModule } from '@/modules/analytics/analytics.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { BrowserSubscribesModule } from '@/modules/browser-subscribes/browser-subscribes.module'
import { ClientModule } from '@/modules/client/client.module'
import { CommunityModule } from '@/modules/community/community.module'
import { DepartmentModule } from '@/modules/department/department.module'
import { ExcelModule } from '@/modules/excel/excel.module'
import { GalleryModule } from '@/modules/gallery/gallery.module'
import { HealthModule } from '@/modules/health/health.module'
import { JobFolderTemplateModule } from '@/modules/job-folder-template/job-folder-template.module'
import { JobStatusModule } from '@/modules/job-status/job-status.module'
import { JobTitleModule } from '@/modules/job-title/job-title.module'
import { JobTypeModule } from '@/modules/job-type/job-type.module'
import { JobModule } from '@/modules/job/job.module'
import { NotificationModule } from '@/modules/notification/notification.module'
import { PaymentChannelModule } from '@/modules/payment-channel/payment-channel.module'
import { RoleModule } from '@/modules/role-permissions/role.module'
import { SharePointModule } from '@/modules/sharepoint/sharepoint.module'
import { UploadModule } from '@/modules/upload/upload.module'
import { UserDevicesModule } from '@/modules/user-devices/user-devices.module'
import { UserModule } from '@/modules/user/user.module'
import { CloudinaryModule } from '@/providers/cloudinary/cloudinary.module'
import { MailModule } from '@/providers/mail/mail.module'
import { PrismaModule } from '@/providers/prisma/prisma.module'
import { RedisModule } from '@/providers/redis/redis.module'
import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PrometheusModule } from '@willsoto/nestjs-prometheus'
import { AdministratorModule } from './modules/administrator/administrator.module'
import { AuditLogModule } from './modules/audit-log/audit-log.module'
import { BullConfigProvider } from './providers/bull-mq/bull-mq.provider'
import { AuditLogProcessor } from './modules/audit-log/audit-log.processor'
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // Để dùng được ở mọi nơi
			load: [
				appConfig,
				databaseConfig,
				authConfig,
				mailConfig,
				azureConfig,
				cloudinaryConfig,
				firebaseConfig,
				ablyConfig,
			],
			envFilePath: ['.env', '../.env'],
		}),
		PrometheusModule.register({
			path: '/metrics', // Đường dẫn để Prometheus lấy dữ liệu
			defaultMetrics: {
				enabled: true, // Tự động thu thập metrics mặc định (CPU, RAM, Event Loop...)
			},
		}),
		// Cấu hình BullMQ
		BullModule.forRootAsync({
			imports: [ConfigModule.forFeature(bullConfig)],
			useClass: BullConfigProvider,
		}),
		// Cấu hình Bull Board Root (Tạo route truy cập)
		BullBoardModule.forRoot({
			route: '/queues', // Đường dẫn truy cập UI
			adapter: ExpressAdapter,
		}),
		ScheduleModule.forRoot(),
		EventEmitterModule.forRoot({
			wildcard: true,
			delimiter: '.', // Ký tự phân cách (mặc định là dấu chấm)
		}),
		PrismaModule,
		RedisModule,
		MailModule,
		SharePointModule,
		CloudinaryModule,
		AblyModule,
		RoleModule,
		AuthModule,
		UserModule,
		UserDevicesModule,
		JobModule,
		JobTypeModule,
		JobStatusModule,
		PaymentChannelModule,
		NotificationModule,
		DepartmentModule,
		JobTitleModule,
		JobFolderTemplateModule,
		GalleryModule,
		BrowserSubscribesModule,
		UploadModule,
		HealthModule,
		ExcelModule,
		AnalyticsModule,
		CommunityModule,
		ClientModule,
		AdministratorModule,
		AuditLogModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
