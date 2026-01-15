import { forwardRef, Module } from '@nestjs/common'
import { JobTypeService } from './job-type.service'
import { JobTypeController } from './job-type.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
	imports: [forwardRef(() => AuthModule)],
	controllers: [JobTypeController],
	providers: [JobTypeService],
	exports: [JobTypeService],
})
export class JobTypeModule {}
