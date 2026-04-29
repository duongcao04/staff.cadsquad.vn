import { authConfig } from '@/config'
import { UserModule } from '@/modules/user/user.module'
import { MailModule } from '@/providers/mail/mail.module'
import { RedisModule } from '@/providers/redis/redis.module'
import { forwardRef, Global, Module } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { BcryptService } from './bcrypt.service'
import { JwtGuard } from './jwt.guard'
import { SessionService } from './session.service'
import { TokenService } from './token.service'
import { WsJwtGuard } from './ws-jwt.guard'
import { MfaController } from '../mfa/mfa.controller'
import { MfaService } from '../mfa/mfa.service'

@Global()
@Module({
	imports: [
		RedisModule,
		MailModule,
		forwardRef(() => UserModule),
		JwtModule.registerAsync({
			inject: [authConfig.KEY],
			useFactory: async (config: ConfigType<typeof authConfig>) => ({
				secret: config.jwt.secret,
				signOptions: {
					expiresIn: config.jwt.expiresIn, // Vd: '1d', '60m'
				},
			}),
		}),
		PassportModule.register({ defaultStrategy: 'jwt' }),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		BcryptService,
		TokenService,
		MfaService,
		JwtGuard,
		WsJwtGuard,
		SessionService,
	],
	exports: [
		AuthService,
		BcryptService,
		TokenService,
		JwtGuard,
		WsJwtGuard,
		SessionService,
	],
})
export class AuthModule {}
