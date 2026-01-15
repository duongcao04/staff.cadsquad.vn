import { AblyService } from '@/modules/ably/ably.service'
import { TokenPayload } from '@/modules/auth/dto/token-payload.dto'
import { JwtGuard } from '@/modules/auth/jwt.guard'
import { Controller, Get, Req, UseGuards } from '@nestjs/common'

@Controller('ably')
@UseGuards(JwtGuard)
export class AblyController {
	constructor(private readonly ablyService: AblyService) {}

	@Get('auth')
	async getAuthToken(@Req() request: Request) {
		const userPayload: TokenPayload = await request['user']
		// Endpoint này sẽ trả về JSON chứa token request đã ký
		return this.ablyService.createTokenRequest(userPayload.sub)
	}
}
