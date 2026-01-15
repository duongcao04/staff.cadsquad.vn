import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator'

export class CreateJobTitleDto {
	@ApiProperty({ description: 'Display name of the job title', example: 'Software Engineer' })
	@IsString()
	@IsNotEmpty()
	displayName: string

	@ApiProperty({ description: 'Optional notes for the job title', required: false, example: 'This is a software engineer role.' })
	@IsOptional()
	@IsString()
	notes?: string

	@ApiProperty({ description: 'Unique code for the job title', example: 'SE' })
	@IsString()
	@IsNotEmpty()
	code: string
}
