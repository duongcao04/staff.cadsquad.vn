import { Inject, Injectable } from '@nestjs/common'
import { toDataURL } from 'qrcode'
import { verify } from '@otplib/totp'
import { crypto } from '@otplib/plugin-crypto-node'
import { base32 } from '@otplib/plugin-base32-scure'
import { UserService } from '../user/user.service'
import { appConfig } from '../../config'
import type { ConfigType } from '@nestjs/config'

@Injectable()
export class MfaService {
	constructor(
		private readonly userService: UserService,
		@Inject(appConfig.KEY)
		private config: ConfigType<typeof appConfig>
	) {}

	// 1. Generate the Base32 secret and the otpauth URL
	public async generateTwoFactorAuthenticationSecret(user: any) {
		// Generate 20 random bytes and encode them as a Base32 string
		const buffer = crypto.randomBytes(20)
		const secret = base32.encode(buffer)

		const appName = this.config.APP_CODE

		// Construct the standard OTP Auth URI
		const otpauthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`

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
	public async isTwoFactorAuthenticationCodeValid(code: string, user: any) {
		// Pass the plugins directly into the verify function
		const isValid = await verify({
			token: code,
			secret: user.twoFactorAuthenticationSecret,
			crypto,
			base32, // Required to decode the Base32 string we generated above
		})

		return isValid
	}
}
