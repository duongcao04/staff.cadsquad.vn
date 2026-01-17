import { AuthModule } from '@/modules/auth/auth.module'
import { FirebaseModule } from '@/providers/firebase/firebase.module'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { forwardRef, Module } from '@nestjs/common'
import { NOTIFICATION_QUEUE } from './notification.constants'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'
import { NotificationProcessor } from './notification.processor'

@Module({
	imports: [
		BullModule.registerQueue({
			name: NOTIFICATION_QUEUE,
		}),
		BullBoardModule.forFeature({
			name: NOTIFICATION_QUEUE,
			adapter: BullMQAdapter,
		}),
		forwardRef(() => AuthModule),
		FirebaseModule,
	],
	controllers: [NotificationController],
	providers: [NotificationService, NotificationProcessor],
	exports: [NotificationService],
})
export class NotificationModule {}
