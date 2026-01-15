import { ActivityType } from '@/generated/prisma'
import { ApiProperty } from '@nestjs/swagger'
import {
	IsEnum,
	IsNotEmpty,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator'

export class CreateActivityLogDto {
	@ApiProperty({
		description: 'ID of the job associated with the activity log',
		example: 'job-id-123',
	})
	@IsString()
	@IsNotEmpty()
	jobId: string

	@ApiProperty({
		description: 'Current value of the field being modified',
		required: false,
	})
	@IsOptional()
	@IsString()
	currentValue?: string

	@ApiProperty({
		description: 'ID of the user who modified the field',
		example: 'user-id-456',
	})
	@IsString()
	@IsNotEmpty()
	modifiedById: string

	@ApiProperty({
		description: 'Name of the field that was modified',
		example: 'status',
	})
	@IsString()
	@IsNotEmpty()
	fieldName: string

	@ApiProperty({
		description: 'Type of activity',
		enum: ActivityType,
		example: 'UPDATE_GENERAL_INFORMATION',
	})
	@IsEnum(ActivityType) // Using IsEnum for stricter validation
	@IsNotEmpty()
	activityType: ActivityType

	@ApiProperty({
		description: 'Additional notes about the activity',
		required: false,
	})
	@IsOptional()
	@IsString()
	notes?: string

	// --- NEW FIELDS FOR PERMISSION & SENSITIVE DATA ---

	@ApiProperty({
		description:
			'Permission code required to view this log. If null, log is public.',
		example: 'job.view_financial',
		required: false,
	})
	@IsOptional()
	@IsString()
	requiredPermissionCode?: string

	@ApiProperty({
		description:
			'Sensitive data stored as JSON (e.g., costs, private feedback)',
		example: { staffCost: 500, adminNote: 'Confidential' },
		required: false,
	})
	@IsOptional()
	@IsObject()
	metadata?: Record<string, any>
}
