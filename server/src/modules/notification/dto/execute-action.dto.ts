import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'
import type { NotificationActionKey } from './notification-action.dto'

export class ExecuteActionDto {
	@ApiProperty({
		description: 'The dynamic action key to execute',
		example: 'ACCEPT_REVIEW',
	})
	@IsString()
	@IsNotEmpty()
	actionKey!: NotificationActionKey
}
