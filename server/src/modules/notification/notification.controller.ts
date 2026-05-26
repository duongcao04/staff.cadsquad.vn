import { ResponseMessage } from '@/common/decorators/responseMessage.decorator'
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import {
    NotFoundResponseDto,
    UnauthorizedResponseDto,
} from '../../common/swagger/api-response.dto'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { BulkCreateNotificationDto } from './dto/bulk-create-notification.dto'
import { CreateNotificationDto } from './dto/create-notification.dto'
import { NotificationResponseDto } from './dto/notification-response.dto'
import { NotificationService } from './notification.service'

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('/send')
    @HttpCode(201)
    @ResponseMessage('Notification created successfully')
    @ApiOperation({
        summary: 'Gửi thông báo tới một hoặc nhiều người',
        description:
            'Tạo và gửi notification. Sender tự động là user đang đăng nhập. Notification được đẩy qua Ably realtime.',
    })
    @ApiBody({ type: CreateNotificationDto })
    @ApiResponse({
        status: 201,
        description: 'Notification đã được tạo và gửi',
        type: NotificationResponseDto,
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async create(
        @Req() request: Request,
        @Body() createNotificationDto: CreateNotificationDto
    ) {
        const userPayload: TokenPayload = await request['user']
        createNotificationDto.senderId = userPayload.sub
        return this.notificationService.send(createNotificationDto)
    }

    @Post('send/bulk')
    @HttpCode(201)
    @ResponseMessage('Notifications queued for multiple users')
    @ApiOperation({
        summary: 'Gửi thông báo đến nhiều user cùng lúc',
        description:
            'Gửi notification hàng loạt đến danh sách `userIds`. Notification được đẩy vào BullMQ queue để xử lý bất đồng bộ.',
    })
    @ApiBody({ type: BulkCreateNotificationDto })
    @ApiResponse({
        status: 201,
        description: 'Notifications đã được đưa vào hàng đợi',
        schema: {
            example: {
                success: true,
                message: 'Notifications queued for multiple users',
                result: { queued: 5 },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async sendToUsers(
        @Req() request: Request,
        @Body() bulkDto: BulkCreateNotificationDto
    ) {
        const userPayload: TokenPayload = await request['user']
        const { userIds, ...notificationData } = bulkDto
        notificationData.senderId = userPayload.sub
        return this.notificationService.sendToUsers(userIds, notificationData)
    }

    @Post('send/:id')
    @HttpCode(201)
    @ResponseMessage('Notification sent to user successfully')
    @ApiOperation({
        summary: 'Gửi thông báo đến một user cụ thể',
        description: 'Gửi notification ngay lập tức đến user theo `userId`.',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID của user nhận notification',
        example: 'uuid-of-receiver',
    })
    @ApiBody({ type: CreateNotificationDto })
    @ApiResponse({
        status: 201,
        description: 'Notification đã được gửi',
        type: NotificationResponseDto,
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto, description: 'User không tồn tại' })
    async sendToUser(
        @Req() request: Request,
        @Param('id') userId: string,
        @Body() createNotificationDto: CreateNotificationDto
    ) {
        const userPayload: TokenPayload = await request['user']
        createNotificationDto.senderId = userPayload.sub
        return this.notificationService.sendToUser(userId, createNotificationDto)
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Notifications retrieved successfully')
    @ApiOperation({
        summary: 'Lấy danh sách thông báo của user hiện tại',
        description: 'Trả về danh sách notification của user đang đăng nhập, hỗ trợ phân trang.',
    })
    @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại (mặc định: 1)', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang (mặc định: 10)', example: 10 })
    @ApiResponse({
        status: 200,
        description: 'Danh sách notifications',
        type: [NotificationResponseDto],
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async findAll(
        @Req() request: Request,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        const userPayload: TokenPayload = await request['user']
        return this.notificationService.findAll(userPayload.sub, page, limit)
    }

    @Patch(':id/seen')
    @HttpCode(200)
    @ResponseMessage('Notification marked as seen')
    @ApiOperation({
        summary: 'Đánh dấu một thông báo là đã đọc',
        description: 'Cập nhật trạng thái `seenAt` của notification. Chỉ owner mới có thể đánh dấu.',
    })
    @ApiParam({ name: 'id', description: 'UUID của notification', example: 'uuid-of-notification' })
    @ApiResponse({
        status: 200,
        description: 'Notification đã được đánh dấu là đã đọc',
        type: NotificationResponseDto,
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async markAsSeen(@Req() request: Request, @Param('id') id: string) {
        const user: TokenPayload = request['user']
        return this.notificationService.markAsSeen(id, user.sub)
    }

    @Patch('mark-all-seen')
    @HttpCode(200)
    @ResponseMessage('All notifications marked as seen')
    @ApiOperation({
        summary: 'Đánh dấu tất cả thông báo là đã đọc',
        description: 'Cập nhật `seenAt` cho toàn bộ notifications chưa đọc của user hiện tại.',
    })
    @ApiResponse({
        status: 200,
        description: 'Tất cả notifications đã được đánh dấu',
        schema: { example: { success: true, message: 'All notifications marked as seen', result: { count: 5 } } },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async markAllAsSeen(@Req() request: Request) {
        const user: TokenPayload = request['user']
        return this.notificationService.markAllAsSeen(user.sub)
    }

    @Delete(':id')
    @HttpCode(200)
    @ResponseMessage('Notification deleted successfully')
    @ApiOperation({
        summary: 'Xóa một thông báo',
        description: 'Xóa vĩnh viễn notification theo ID.',
    })
    @ApiParam({ name: 'id', description: 'UUID của notification cần xóa', example: 'uuid-of-notification' })
    @ApiResponse({ status: 200, description: 'Notification đã được xóa' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async remove(@Param('id') id: string) {
        return this.notificationService.delete(id)
    }
}
