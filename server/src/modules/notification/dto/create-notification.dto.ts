import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsEnum } from 'class-validator'
import { NotificationType } from '../../../generated/prisma'
import { IMAGES } from '../../../utils'

export class CreateNotificationDto {
	@ApiProperty({
		description: 'Title of the notification',
		required: false,
		example: 'New Message',
	})
	@IsOptional()
	@IsString()
	title?: string

	@ApiProperty({
		description: 'Content of the notification',
		example: 'You have a new message from John Doe.',
	})
	@IsString()
	content: string

	@ApiProperty({
		description: 'URL of an image for the notification',
		required: false,
	})
	@IsOptional()
	@IsString()
	imageUrl?: string = IMAGES.NOTIFICATION_DEFAULT_IMAGE

	@ApiProperty({ description: 'ID of the sender', required: false })
	@IsOptional()
	@IsString()
	senderId?: string

	@ApiProperty({
		description: 'URL to redirect to when the notification is clicked',
		required: false,
	})
	@IsOptional()
	@IsString()
	redirectUrl?: string

	@ApiProperty({
		description: 'Type of the notification',
		enum: NotificationType,
		default: NotificationType.INFO,
		required: false,
	})
	@IsOptional()
	@IsEnum(NotificationType)
	type?: NotificationType = NotificationType.INFO

	@ApiProperty({ description: 'ID of the user to receive the notification' })
	@IsString()
	userId: string
}
