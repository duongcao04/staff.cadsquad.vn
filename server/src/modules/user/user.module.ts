import { AuthModule } from '@/modules/auth/auth.module'
import { MailModule } from '@/providers/mail/mail.module'
import { RedisModule } from '@/providers/redis/redis.module'
import { forwardRef, Module } from '@nestjs/common'
import { JobModule } from '../job/job.module'
import { NotificationModule } from '../notification/notification.module'
import { UserSecurityService } from './user-security.service'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
	imports: [
		RedisModule,
		forwardRef(() => AuthModule),
		forwardRef(() => JobModule),
		MailModule,
		NotificationModule,
	],
	controllers: [UserController],
	providers: [UserService, UserSecurityService],
	exports: [UserService, UserSecurityService],
})
export class UserModule {}
