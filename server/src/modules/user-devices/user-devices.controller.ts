import { ResponseMessage } from '@/common/decorators/responseMessage.decorator'
import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateUserDeviceDto } from '../user-devices/dto/create-user-device.dto'
import { UserDevicesService } from './user-devices.service'

@Controller('user-devices')
@UseGuards(JwtGuard)
export class UserDevicesController {
	constructor(private readonly devicesService: UserDevicesService) {}

	@Post('register')
	@ResponseMessage('Đã đăng ký thiết bị nhận thông báo')
	async register(@Req() request: Request, @Body() dto: CreateUserDeviceDto) {
		const user: TokenPayload = request['user']
		const result = await this.devicesService.registerDevice(user.sub, dto)
		return result
	}

	@Patch('logout')
	@ResponseMessage('Đã vô hiệu hóa thông báo trên thiết bị này')
	async logout(@Body('token') token: string) {
		await this.devicesService.logoutDevice(token)
		return true
	}
}
