import { AuthModule } from '@/modules/auth/auth.module'
import { FirebaseModule } from '@/providers/firebase/firebase.module'
import { forwardRef, Module } from '@nestjs/common'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

@Module({
	imports: [forwardRef(() => AuthModule), FirebaseModule],
	controllers: [NotificationController],
	providers: [NotificationService],
	exports: [NotificationService],
})
export class NotificationModule {}
