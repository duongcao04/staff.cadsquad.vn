import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateNotificationDto } from './dto/create-notification.dto'
import { NotificationResponseDto } from './dto/notification-response.dto'
import { NotificationService } from './notification.service'

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('/send')
    @HttpCode(201)
    @ApiBearerAuth()
    @ResponseMessage('Create notification successfully')
    @ApiOperation({ summary: 'Create and send a new notification' })
    @ApiResponse({
        status: 201,
        description: 'The notification has been successfully created.',
        type: NotificationResponseDto,
    })
    async create(
        @Req() request: Request,
        @Body() createNotificationDto: CreateNotificationDto
    ) {
        const userPayload: TokenPayload = await request['user']
        createNotificationDto.senderId = userPayload.sub

        return this.notificationService.send(createNotificationDto)
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of notifications successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all notifications for the current user' })
    @ApiResponse({
        status: 200,
        description: 'Return a list of notifications.',
        type: [NotificationResponseDto],
    })
    async findAll(@Req() request: Request) {
        const userPayload: TokenPayload = await request['user']
        return this.notificationService.findAll(userPayload.sub)
    }

    @Patch(':id/seen')
    @HttpCode(200)
    @ApiBearerAuth()
    @ResponseMessage('Đã đánh dấu thông báo là đã xem')
    @ApiOperation({ summary: 'Update a notification' })
    @ApiResponse({
        status: 200,
        description: 'The notification has been successfully updated.',
        type: NotificationResponseDto,
    })
    async markAsSeen(@Req() request: Request, @Param('id') id: string) {
        const user: TokenPayload = request['user']
        return this.notificationService.markAsSeen(id, user.sub)
    }

    @Patch('mark-all-seen')
    @ResponseMessage('Đã đánh dấu tất cả thông báo là đã đọc')
    async markAllAsSeen(@Req() request: Request) {
        const user: TokenPayload = request['user']
        // req.user.id lấy từ JwtAuthGuard
        return await this.notificationService.markAllAsSeen(user.sub)
    }

    @Delete(':id')
    @HttpCode(200)
    @ApiBearerAuth()
    @ResponseMessage('Delete notification successfully')
    @ApiOperation({ summary: 'Delete a notification' })
    @ApiResponse({
        status: 200,
        description: 'The notification has been successfully deleted.',
    })
    async remove(@Param('id') id: string) {
        return this.notificationService.delete(id)
    }
}
