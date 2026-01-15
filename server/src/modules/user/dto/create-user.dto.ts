import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator'

export class CreateUserDto {
	@ApiProperty({
		description: 'Display name of the user',
		example: 'John Doe',
	})
	@IsString()
	displayName: string

	@ApiProperty({ description: 'User email', example: 'john.doe@cadsquad.vn' })
	@IsEmail()
	email: string

	@ApiProperty({ description: 'ID of the user role', required: false })
	@IsOptional()
	@IsString()
	roleId?: string

	@ApiProperty({
		description: 'User password',
		required: false,
		example: 'password123',
	})
	@IsNotEmpty()
	@IsString()
	password: string

	@ApiProperty({ description: "ID of the user's job title", required: false })
	@IsOptional()
	@IsString()
	jobTitleId?: string

	@ApiProperty({
		description: "ID of the user's department",
		required: false,
	})
	@IsOptional()
	@IsString()
	departmentId?: string
}
