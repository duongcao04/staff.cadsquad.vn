import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class CreateJobTypeDto {
	@ApiProperty({ description: 'Unique code for the job type', example: 'WEB_DEV' })
	@IsString()
	@IsNotEmpty()
	code: string

	@ApiProperty({ description: 'Display name of the job type', example: 'Web Development' })
	@IsString()
	@IsNotEmpty()
	displayName: string

	@ApiProperty({ description: 'Hex color code for the job type', required: false, example: '#3498db' })
	@IsOptional()
	@IsString()
	@Matches(/^#([0-9A-Fa-f]{6})$/, {
		message: 'hexColor must be a valid hex color code (e.g. #FFFFFF)',
	})
	hexColor?: string
}
