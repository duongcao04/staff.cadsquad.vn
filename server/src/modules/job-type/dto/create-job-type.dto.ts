import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsHexColor,
	IsNotEmpty,
	IsOptional,
	IsString
} from 'class-validator';

export class CreateJobTypeDto {
	@ApiProperty({
		example: 'CONST-01',
		description: 'The internal code for the job type',
	})
	@IsString()
	@IsNotEmpty()
	code!: string;

	@ApiProperty({
		example: 'Construction',
		description: 'The display name shown in the UI',
	})
	@IsString()
	@IsNotEmpty()
	displayName!: string;

	@ApiPropertyOptional({
		example: 'sp-folder-123-abc',
		description: 'The unique identifier for the SharePoint folder',
	})
	@IsString()
	@IsOptional()
	sharepointFolderId?: string;

	@ApiPropertyOptional({
		example: '#FF5733',
		description: 'Hexadecimal color code for UI categorization',
	})
	@IsHexColor()
	@IsOptional()
	hexColor?: string;
}