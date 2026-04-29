import {
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common'
import { toDataURL } from 'qrcode'
import { verify } from '@otplib/totp'
import { crypto } from '@otplib/plugin-crypto-node'
import { base32 } from '@otplib/plugin-base32-scure'
import { UserService } from '../user/user.service'
import { appConfig } from '../../config'
import type { ConfigType } from '@nestjs/config'
import { User } from '../../generated/prisma'

@Injectable()
export class MfaService {
	constructor(
		private readonly userService: UserService,
		@Inject(appConfig.KEY)
		private config: ConfigType<typeof appConfig>
	) {}

	// 1. Generate the Base32 secret and the otpauth URL
	public async generateTwoFactorAuthenticationSecret(
		user: Pick<User, 'code' | 'id'>
	) {
		// Generate 20 random bytes and encode them as a Base32 string
		const buffer = crypto.randomBytes(20)
		const secret = base32.encode(buffer)

		const appName = this.config.APP_CODE
		const logoUrl =
			'https://res.cloudinary.com/dqx1guyc0/image/upload/v1765885688/AVATAR-_Fiverr_kwcsip.png'

		// Construct the standard OTP Auth URI
		const otpauthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(user.code)}?secret=${secret}&issuer=${encodeURIComponent(appName)}&image=${encodeURIComponent(logoUrl)}`

		// Save the Base32 secret to the user in your database
		await this.userService.setTwoFactorAuthenticationSecret(secret, user.id)

		return {
			secret,
			otpauthUrl,
		}
	}

	// 2. Generate a QR Code for the frontend to render
	public async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl)
	}

	// 3. Verify the 6-digit code from the Authenticator app
	public async isTwoFactorAuthenticationCodeValid(
		code: string,
		userId: string
	) {
		const user = await this.userService.findById(userId)

		if (!user) {
			throw new NotFoundException('Not found user')
		}

		if (!user.twoFactorAuthenticationSecret) {
			throw new InternalServerErrorException(
				'2FA secret is not set for this user'
			)
		}

		try {
			const isValid = await verify({
				token: code,
				secret: user.twoFactorAuthenticationSecret,
				crypto,
				base32,
			})

			return isValid.valid
		} catch (error) {
			throw new InternalServerErrorException(
				'Validate 2FA error',
				(error as Error).message
			)
		}
	}
}
