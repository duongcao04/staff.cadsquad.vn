import { ResponseMessage } from '@/common/decorators/responseMessage.decorator'
import {
    Body,
    Controller,
    HttpCode,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { BadRequestResponseDto, UnauthorizedResponseDto } from '../../common/swagger/api-response.dto'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateUserDeviceDto } from '../user-devices/dto/create-user-device.dto'
import { UserDevicesService } from './user-devices.service'

@ApiTags('User Devices')
@Controller('user-devices')
@UseGuards(JwtGuard)
export class UserDevicesController {
    constructor(private readonly devicesService: UserDevicesService) {}

    @Post('register')
    @HttpCode(201)
    @ApiBearerAuth()
    @ResponseMessage('Đã đăng ký thiết bị nhận thông báo')
    @ApiOperation({
        summary: 'Đăng ký thiết bị để nhận push notification',
        description:
            'Lưu FCM token của thiết bị vào tài khoản user. Sau khi đăng ký, thiết bị sẽ nhận được push notification.',
    })
    @ApiBody({ type: CreateUserDeviceDto })
    @ApiResponse({
        status: 201,
        description: 'Thiết bị đã được đăng ký',
        schema: {
            example: {
                success: true,
                message: 'Đã đăng ký thiết bị nhận thông báo',
                result: { id: 'uuid', token: 'fcm-token', platform: 'WEB' },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async register(@Req() request: Request, @Body() dto: CreateUserDeviceDto) {
        const user: TokenPayload = request['user']
        return this.devicesService.registerDevice(user.sub, dto)
    }

    @Patch('logout')
    @HttpCode(200)
    @ApiBearerAuth()
    @ResponseMessage('Đã vô hiệu hóa thông báo trên thiết bị này')
    @ApiOperation({
        summary: 'Vô hiệu hóa push notification cho thiết bị',
        description:
            'Đánh dấu FCM token là inactive. Thiết bị sẽ không nhận notification cho đến khi đăng ký lại.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {
                    type: 'string',
                    description: 'FCM token của thiết bị cần vô hiệu hóa',
                    example: 'dJJKrCb0RP...',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Thiết bị đã bị vô hiệu hóa' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async logout(@Body('token') token: string) {
        await this.devicesService.logoutDevice(token)
        return true
    }
}
