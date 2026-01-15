import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { NotificationType } from '../../../generated/prisma'

export class NotificationResponseDto {
	@ApiProperty({ description: 'Notification ID' })
	@Expose()
	id: string

	@ApiProperty({ description: 'Title of the notification', required: false })
	@Expose()
	title?: string

	@ApiProperty({ description: 'Content of the notification' })
	@Expose()
	content: string

	@ApiProperty({
		description: 'URL of an image for the notification',
		required: false,
	})
	@Expose()
	imageUrl?: string

	@ApiProperty({ description: 'ID of the sender', required: false })
	@Expose()
	senderId?: string

	@ApiProperty({ description: 'Status of the notification' })
	@Expose()
	status: string

	@ApiProperty({
		description: 'URL to redirect to when the notification is clicked',
		required: false,
	})
	@Expose()
	redirectUrl?: string

	@ApiProperty({
		description: 'Type of the notification',
		enum: NotificationType,
	})
	@Expose()
	type: NotificationType

	@ApiProperty({
		description: 'ID of the user who received the notification',
	})
	@Expose()
	userId: string

	@ApiProperty({ description: 'Creation timestamp' })
	@Expose()
	createdAt: Date

	@ApiProperty({ description: 'Last update timestamp' })
	@Expose()
	updatedAt: Date
}
