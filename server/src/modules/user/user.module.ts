import { AuthModule } from '@/modules/auth/auth.module'
import { MailModule } from '@/providers/mail/mail.module'
import { RedisModule } from '@/providers/redis/redis.module'
import { forwardRef, Module } from '@nestjs/common'
import { JobModule } from '../job/job.module'
import { NotificationModule } from '../notification/notification.module'
import { UserSecurityService } from './user-security.service'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CqrsModule } from '@nestjs/cqrs'
import { QueryHandlers } from './queries'
import { UserHelperService } from './user-helper.service'
import { GetScheduleQuery } from './queries/impl/get-schedule.query'

@Module({
	imports: [
		RedisModule,
		forwardRef(() => AuthModule),
		forwardRef(() => JobModule),
		MailModule,
		NotificationModule,
		CqrsModule,
	],
	controllers: [UserController],
	providers: [
		UserHelperService,
		UserService,
		UserSecurityService,
		...QueryHandlers,
	],
	exports: [UserService, UserSecurityService],
})
export class UserModule { }
