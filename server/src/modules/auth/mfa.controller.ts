import {
	Controller,
	Post,
	Res,
	UseGuards,
	Req,
	Body,
	UnauthorizedException,
} from '@nestjs/common'
import { MfaService } from './mfa.service'
import { JwtGuard } from './jwt.guard'
import { UserService } from '../user/user.service'
import type { Response } from 'express'

@Controller('mfa')
export class MfaController {
	constructor(
		private readonly mfaService: MfaService,
		private readonly userService: UserService
	) {}

	// --- SETUP STAGE 1: Generate QR Code ---
	@Post('generate')
	@UseGuards(JwtGuard)
	async register(@Res() response: Response, @Req() request: any) {
		const { otpauthUrl } =
			await this.mfaService.generateTwoFactorAuthenticationSecret(
				request.user
			)

		const qrCodeImage =
			await this.mfaService.generateQrCodeDataURL(otpauthUrl)

		// Send the QR code image back to the client to be scanned
		return response.json({ qrCode: qrCodeImage })
	}

	// --- SETUP STAGE 2: Turn on MFA ---
	@Post('turn-on')
	@UseGuards(JwtGuard)
	async turnOnTwoFactorAuthentication(
		@Req() request: any,
		@Body('code') code: string
	) {
		const isCodeValid = this.mfaService.isTwoFactorAuthenticationCodeValid(
			code,
			request.user
		)

		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code')
		}

		// Mark MFA as enabled in the database
		await this.userService.turnOnTwoFactorAuthentication(request.user.id)
		return { message: 'MFA enabled successfully' }
	}

	// --- LOGIN STAGE: Authenticate with MFA ---
	@Post('authenticate')
	@UseGuards(JwtGuard)
	// NOTE: This guard should only check if a valid initial login token exists.
	async authenticate(@Req() request: any, @Body('code') code: string) {
		const isCodeValid = this.mfaService.isTwoFactorAuthenticationCodeValid(
			code,
			request.user
		)

		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code')
		}

		// Here, you would issue the FINAL JWT token that grants full access
		// to your application, now that 2FA has passed.
		// const accessToken = this.authService.getCookieWithJwtToken(request.user.id, true);

		return {
			message: 'Authenticated successfully' /* token: accessToken */,
		}
	}
}
