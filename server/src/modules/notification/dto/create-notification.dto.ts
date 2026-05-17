import { ApiProperty } from '@nestjs/swagger'
import {
	IsOptional,
	IsString,
	IsEnum,
	IsObject,
	IsArray,
	IsBoolean,
} from 'class-validator'
import { NotificationType, NotificationSeverity } from '@/generated/prisma'
import { IMAGES } from '@/utils'

export class CreateNotificationDto {
	@ApiProperty({ description: 'ID of the user receiving the notification' })
	@IsString()
	userId!: string

	@ApiProperty({
		description: 'ID of the user who triggered the event',
		required: false,
	})
	@IsOptional()
	@IsString()
	senderId?: string

	// --- CLASSIFICATION ---

	@ApiProperty({
		description: 'The specific event that occurred (Domain Logic)',
		enum: NotificationType,
		example: NotificationType.JOB_REVIEW_REQUESTED,
	})
	@IsEnum(NotificationType)
	type!: NotificationType // Made required because the system MUST know what event happened

	@ApiProperty({
		description: 'Visual importance level for the UI',
		enum: NotificationSeverity,
		default: NotificationSeverity.INFO,
		required: false,
	})
	@IsOptional()
	@IsEnum(NotificationSeverity)
	severity?: NotificationSeverity = NotificationSeverity.INFO

	// --- CONTENT ---

	@ApiProperty({
		description: 'Short title of the notification',
		required: false,
		example: 'Review Requested',
	})
	@IsOptional()
	@IsString()
	title?: string

	@ApiProperty({
		description: 'Main body content of the notification',
		example: 'Rúben Rocha asks you to review Process 99827.',
	})
	@IsString()
	content!: string

	@ApiProperty({
		description: 'URL of an image/icon for the notification',
		required: false,
	})
	@IsOptional()
	@IsString()
	imageUrl?: string = IMAGES.NOTIFICATION_DEFAULT_IMAGE

	// --- ROUTING & DYNAMIC ACTIONS ---

	@ApiProperty({
		description:
			'Standard URL to redirect to when the notification card is clicked',
		required: false,
	})
	@IsOptional()
	@IsString()
	redirectUrl?: string

	@ApiProperty({
		description:
			'ID of the related Job (used for filtering and cascading deletes)',
		required: false,
	})
	@IsOptional()
	@IsString()
	jobId?: string

	@ApiProperty({
		description: 'Dynamic actionable buttons to render on the frontend',
		required: false,
		type: 'array',
		example: [
			{
				id: 'btn-1',
				label: 'Accept',
				variant: 'solid',
				color: 'primary',
				actionKey: 'ACCEPT_REVIEW',
			},
		],
	})
	@IsOptional()
	@IsArray()
	actions?: any[]

	@ApiProperty({
		description:
			'Hidden contextual data required to process dynamic actions on the backend',
		required: false,
		example: { relatedJobId: '12345' },
	})
	@IsOptional()
	@IsObject()
	metadata?: Record<string, any>

	@ApiProperty({
		description: 'Whether to display the dynamic actions on the UI',
		required: false,
		default: true,
	})
	@IsOptional()
	@IsBoolean()
	showActions?: boolean = true
}
