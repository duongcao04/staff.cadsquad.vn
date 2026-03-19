import { forwardRef, Module } from '@nestjs/common'
import { JobService } from './job.service'
import { JobController } from './job.controller'
import { AuthModule } from '../auth/auth.module'
import { ActivityLogService } from './activity-log.service'
import { UserModule } from '../user/user.module'
import { UserConfigModule } from '../user-config/user-config.module'
import { NotificationModule } from '../notification/notification.module'
import { JobTypeModule } from '../job-type/job-type.module'
import { JobCommentService } from './job-comment.service'
import { JobReminderService } from './job-reminder.service'
import { SharePointModule } from '../sharepoint/sharepoint.module'
import { RoleModule } from '../role-permissions/role.module'
import { MailModule } from '../../providers/mail/mail.module'
import { JobDeliverService } from './job-deliver.service'

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
	],
	controllers: [JobController],
	providers: [
		JobService,
		JobDeliverService,
		ActivityLogService,
		JobCommentService,
		JobReminderService,
	],
	exports: [JobService, ActivityLogService, JobCommentService],
})
export class JobModule { }
