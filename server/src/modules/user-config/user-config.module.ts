import { forwardRef, Module } from '@nestjs/common'
import { UserConfigService } from './user-config.service'
import { UserConfigController } from './user-config.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
	imports: [forwardRef(() => AuthModule)],
	controllers: [UserConfigController],
	providers: [UserConfigService],
	exports: [UserConfigService],
})
export class UserConfigModule {}
