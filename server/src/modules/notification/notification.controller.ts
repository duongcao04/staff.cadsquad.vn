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
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { BulkCreateNotificationDto } from './dto/bulk-create-notification.dto'
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
	@ResponseMessage('Notification created successfully')
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

	/**
	 * {
		"userIds": [
		    "123-abc-uuid",
		    "456-def-uuid",
		    "789-ghi-uuid"
		],
		"title": "System Maintenance",
		"content": "The system will be down for 1 hour tonight.",
		"type": "WARNING",
		"redirectUrl": "/system-status"
		}
	 */
	@Post('send/bulk')
	@HttpCode(201)
	@ApiBearerAuth()
	@ResponseMessage('Notifications queued for multiple users')
	@ApiOperation({ summary: 'Send a notification to a list of Users' })
	@ApiResponse({
		status: 201,
		description: 'The notifications have been successfully queued.',
	})
	async sendToUsers(
		@Req() request: Request,
		@Body() bulkDto: BulkCreateNotificationDto
	) {
		const userPayload: TokenPayload = await request['user']

		// Extract userIds array and the rest of the notification data
		const { userIds, ...notificationData } = bulkDto

		// Set sender ID
		notificationData.senderId = userPayload.sub

		// Call the bulk service method
		return this.notificationService.sendToUsers(userIds, notificationData)
	}

	@Post('send/:id')
	@HttpCode(201)
	@ApiBearerAuth()
	@ResponseMessage('Notification sent to user successfully')
	@ApiOperation({ summary: 'Send a notification to a specific User ID' })
	@ApiParam({
		name: 'id',
		description: 'The ID of the user receiving the notification',
	})
	@ApiResponse({
		status: 201,
		description: 'The notification has been successfully sent.',
		type: NotificationResponseDto,
	})
	async sendToUser(
		@Req() request: Request,
		@Param('id') userId: string,
		@Body() createNotificationDto: CreateNotificationDto
	) {
		const userPayload: TokenPayload = await request['user']

		// 1. Set the sender as the current logged-in user (Admin/System)
		createNotificationDto.senderId = userPayload.sub

		// 2. Call the specific service method for targeting a user
		// Note: We use the helper method 'sendToUser' added to the Service previously
		return this.notificationService.sendToUser(
			userId,
			createNotificationDto
		)
	}

	@Get()
	@HttpCode(200)
	@ResponseMessage('Notifications retrieved successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all notifications for the current user' })
	@ApiResponse({
		status: 200,
		description: 'Returns a list of notifications.',
		type: [NotificationResponseDto],
	})
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
	@ApiBearerAuth()
	@ResponseMessage('Notification marked as seen')
	@ApiOperation({ summary: 'Mark a specific notification as seen' })
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
	@HttpCode(200)
	@ApiBearerAuth()
	@ResponseMessage('All notifications marked as seen')
	@ApiOperation({
		summary: 'Mark all notifications as seen for current user',
	})
	@ApiResponse({
		status: 200,
		description: 'All notifications have been successfully updated.',
	})
	async markAllAsSeen(@Req() request: Request) {
		const user: TokenPayload = request['user']
		return await this.notificationService.markAllAsSeen(user.sub)
	}

	@Delete(':id')
	@HttpCode(200)
	@ApiBearerAuth()
	@ResponseMessage('Notification deleted successfully')
	@ApiOperation({ summary: 'Delete a notification' })
	@ApiResponse({
		status: 200,
		description: 'The notification has been successfully deleted.',
	})
	async remove(@Param('id') id: string) {
		return this.notificationService.delete(id)
	}
}
