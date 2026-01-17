import { ApiProperty, OmitType } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsString } from 'class-validator'
import { CreateNotificationDto } from './create-notification.dto'

export class BulkCreateNotificationDto extends OmitType(CreateNotificationDto, [
	'userId',
] as const) {
	@ApiProperty({
		description: 'List of target User IDs',
		example: ['user-uuid-1', 'user-uuid-2'],
		type: [String],
	})
	@IsArray()
	@IsString({ each: true }) // Validate each item is a string
	@ArrayMinSize(1) // Ensure at least 1 ID is provided
	userIds: string[]
}
