import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { MfaController } from './mfa.controller'
import { MfaService } from './mfa.service'

@Module({
	imports: [UserModule],
	controllers: [MfaController],
	providers: [MfaService],
})
export class MfaModule {}
