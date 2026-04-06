import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MailModule } from '../../providers/mail/mail.module'
import { AuthModule } from '../auth/auth.module'
import { JobTypeModule } from '../job-type/job-type.module'
import { NotificationModule } from '../notification/notification.module'
import { RoleModule } from '../role-permissions/role.module'
import { SharePointModule } from '../sharepoint/sharepoint.module'
import { UserConfigModule } from '../user-config/user-config.module'
import { UserModule } from '../user/user.module'
import { ActivityLogService } from './activity-log.service'
import { CommandHandlers } from './commands'
import { JobCommentService } from './job-comment.service'
import { JobDeliverService } from './job-deliver.service'
import { JobHelpersService } from './job-helpers.service'
import { JobReminderService } from './job-reminder.service'
import { JobController } from './job.controller'
import { JobService } from './job.service'
import { JobNotificationListener } from './listeners/job-notification.listener'
import { QueryHandlers } from './queries'

@Module({
	imports: [
		forwardRef(() => AuthModule),
		forwardRef(() => UserModule),
		UserConfigModule,
		NotificationModule,
		JobTypeModule,
		SharePointModule,
		MailModule,
		RoleModule,
		CqrsModule,
	],
	controllers: [JobController],
	providers: [
		JobHelpersService,
		JobService,
		JobDeliverService,
		ActivityLogService,
		JobCommentService,
		JobReminderService,
		JobNotificationListener,
		...CommandHandlers,
		...QueryHandlers,
	],
	exports: [JobService, ActivityLogService, JobCommentService],
})
export class JobModule { }
