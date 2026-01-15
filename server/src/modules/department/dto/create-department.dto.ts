import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, IsNotEmpty } from 'class-validator'

export class CreateDepartmentDto {
	@ApiProperty({ description: 'Display name of the department', example: 'Human Resources' })
	@IsString()
	@IsNotEmpty()
	displayName: string

	@ApiProperty({ description: 'Optional notes for the department', required: false, example: 'This is the HR department.' })
	@IsOptional()
	@IsString()
	notes?: string

	@ApiProperty({ description: 'Unique code for the department', example: 'HR' })
	@IsString()
	@IsNotEmpty()
	code: string

	@ApiProperty({ description: 'Hex color code for the department', required: false, example: '#FF5733' })
	@IsOptional()
	@IsString()
	@Matches(/^#([0-9A-Fa-f]{6})$/, {
		message: 'hexColor must be a valid hex color code (e.g. #FFFFFF)',
	})
	hexColor?: string
}
