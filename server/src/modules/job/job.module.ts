import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
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
import { JOB_FLOW, JOB_QUEUE } from './job.constants'
import { JobController } from './job.controller'
import { JobService } from './job.service'
import { JobNotificationListener } from './listeners/job-notification.listener'
import { JobSharepointListener } from './listeners/job-sharepoint.listener'
import { QueryHandlers } from './queries'
import { JobProcessor } from './job.processor'

const EventListeners = [JobNotificationListener, JobSharepointListener]

@Module({
	imports: [
		BullModule.registerQueue({
			name: JOB_QUEUE,
		}),
		BullBoardModule.forFeature({
			name: JOB_QUEUE,
			adapter: BullMQAdapter,
		}),
		BullModule.registerFlowProducer({
			name: JOB_FLOW,
		}),
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
		JobProcessor,
		...EventListeners,
		...CommandHandlers,
		...QueryHandlers,
	],
	exports: [JobService, ActivityLogService, JobCommentService],
})
export class JobModule {}

