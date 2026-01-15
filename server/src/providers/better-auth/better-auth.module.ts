import { PrismaModule } from '@/providers/prisma/prisma.module'
import { Global, Module } from '@nestjs/common'
import { BetterAuthProvider } from './better-auth.provider'
import { BetterAuthController } from './better-auth.controller'

@Global()
@Module({
	imports: [PrismaModule],
	controllers: [BetterAuthController],
	providers: [BetterAuthProvider],
	exports: [BetterAuthProvider],
})
export class BetterAuthModule {}
