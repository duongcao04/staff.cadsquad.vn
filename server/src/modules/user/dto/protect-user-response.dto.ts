import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { RoleResponseDto } from '../../role-permissions/dtos/role-response.dto'

/**
 * This DTO is used for public-facing user representation, excluding sensitive information like password and ID.
 */
export class ProtectUserResponseDto {
	@Exclude()
	id: string

	@Exclude()
	password: string

	@ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
	@Expose()
	email: string

	@ApiProperty({ description: 'Username', example: 'john.doe' })
	@Expose()
	username: string

	@ApiProperty({
		description: 'Display name of the user',
		example: 'John Doe',
	})
	@Expose()
	displayName: string

	@ApiProperty({
		description: 'URL of the user avatar',
		required: false,
		example: 'https://example.com/avatar.png',
	})
	@Expose()
	avatar?: string

	@ApiProperty({ description: 'Job titles of the user', required: false })
	@Expose()
	jobTitles?: string

	@ApiProperty({ description: 'Department of the user', required: false })
	@Expose()
	department?: string

	@ApiProperty({
		description: 'User phone number',
		required: false,
		example: '+1234567890',
	})
	@Expose()
	phoneNumber?: string

	@ApiProperty({ description: 'Role of the user', type: RoleResponseDto })
	@Expose()
	role: RoleResponseDto

	@ApiProperty({ description: 'Whether the user is active' })
	@Expose()
	isActive: boolean

	@ApiProperty({ description: 'Last login timestamp', required: false })
	@Expose()
	lastLoginAt?: Date

	@ApiProperty({ description: 'Creation timestamp' })
	@Expose()
	createdAt: Date

	@ApiProperty({ description: 'Last update timestamp' })
	@Expose()
	updatedAt: Date
}
