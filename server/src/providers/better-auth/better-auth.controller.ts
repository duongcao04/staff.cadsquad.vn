import { All, Controller, Inject, Req, Res } from '@nestjs/common'
import { toNodeHandler } from 'better-auth/node'
import type { Request, Response } from 'express'
import { BETTER_AUTH } from './better-auth.provider'

@Controller('better-auth') // Mount tại /api/v1/better-auth
export class BetterAuthController {
	constructor(@Inject(BETTER_AUTH) private readonly auth: any) {}

	@All('*path')
	async handleAuth(@Req() req: Request, @Res() res: Response) {
		// Dùng helper toNodeHandler của better-auth để tương thích với NestJS/Express
		return toNodeHandler(this.auth)(req, res)
	}
}
