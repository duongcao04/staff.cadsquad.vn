import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateConfigDto {
	@ApiProperty({ description: 'Display name of the configuration', example: 'My Config' })
	@IsNotEmpty()
	@IsString()
	displayName: string

	@ApiProperty({ description: 'Unique code for the configuration', example: 'MY_CONFIG' })
	@IsNotEmpty()
	@IsString()
	code: string

	@ApiProperty({ description: 'Value of the configuration', example: 'some_value' })
	@IsNotEmpty()
	@IsString()
	value: string
}
