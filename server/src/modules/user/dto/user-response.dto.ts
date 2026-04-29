import { JobTitleResponseDto } from '@//modules/job-title/dto/job-title-response.dto'
import { RoleResponseDto } from '@//modules/role-permissions/dtos/role-response.dto'
import { DepartmentResponseDto } from '@/modules/department/dto/department-response.dto'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { SecurityLogResponseDto } from './security-log/security-log-response.dto'

export class UserResponseDto {
	@ApiProperty({
		description: 'User ID',
		example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
	})
	@Expose()
	id: string

	@Exclude()
	password: string

	@ApiProperty({ description: 'User email', example: 'user@cadsquad.vn' })
	@Expose()
	email: string

	@ApiProperty({ description: 'Personal email', example: 'user@example.com' })
	@Expose()
	personalEmail?: string

	@ApiProperty({ description: 'Username', example: 'john.doe' })
	@Expose()
	username: string

	@ApiProperty({ description: 'User display name', example: 'John Doe' })
	@Expose()
	displayName: string

	@ApiProperty({ description: 'Staff code', example: 'ST001' })
	@Expose()
	code: string

	@ApiProperty({ description: 'Role of the user' })
	@Expose()
	role: RoleResponseDto

	@ApiProperty({
		description: 'URL of the user avatar',
		required: false,
		example: 'https://example.com/avatar.png',
	})
	@Expose()
	avatar?: string

	@ApiProperty({ description: 'Job titles of the user', required: false })
	@Expose()
	jobTitle?: JobTitleResponseDto

	@ApiProperty({
		description: 'User security logs such as Login, Reset password, etc',
	})
	@Expose()
	securityLogs?: SecurityLogResponseDto[]

	@ApiProperty({ description: 'Department of the user', required: false })
	@Expose()
	department?: DepartmentResponseDto

	@ApiProperty({
		description: 'User phone number',
		required: false,
		example: '+1234567890',
	})
	@Expose()
	phoneNumber?: string

	@ApiProperty({ description: 'Whether the user is active', example: true })
	@Expose()
	isActive: boolean

	@ApiProperty({ description: '', example: true })
	@Expose()
	isTwoFactorAuthenticationEnabled!: boolean

	twoFactorAuthenticationSecret?: string

	@ApiProperty({ description: 'Last login timestamp', required: false })
	@Expose()
	lastLoginAt?: Date

	@ApiProperty({ description: 'Creation timestamp' })
	@Expose()
	createdAt: Date

	@ApiProperty({ description: 'Last update timestamp' })
	@Expose()
	updatedAt: Date

	@ApiProperty({ description: 'Deleted At' })
	@Expose()
	deletedAt: Date
}
