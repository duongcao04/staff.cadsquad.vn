import { ApiProperty } from '@nestjs/swagger';
import {
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	Matches,
} from 'class-validator'

export class CreateJobStatusDto {
	@ApiProperty({ description: 'Display name of the job status', example: 'In Progress' })
	@IsString()
	@IsNotEmpty()
	displayName: string

	@ApiProperty({ description: 'URL of the thumbnail for the job status', required: false, example: 'https://example.com/thumbnail.png' })
	@IsOptional()
	@IsUrl({}, { message: 'thumbnailUrl must be a valid URL' })
	thumbnailUrl?: string

	@ApiProperty({ description: 'Hex color code for the job status', example: '#3498db' })
	@IsString()
	@IsNotEmpty()
	@Matches(/^#([0-9A-Fa-f]{6})$/, {
		message: 'hexColor must be a valid hex color code (e.g. #FFFFFF)',
	})
	hexColor: string

	@ApiProperty({ description: 'Order of the job status in the workflow', example: 1 })
	@IsInt()
	@IsNotEmpty()
	order: number

	@ApiProperty({ description: 'Unique code for the job status', example: 'IN_PROGRESS' })
	@IsString()
	@IsNotEmpty()
	code: string

	@ApiProperty({ description: 'Icon for the job status', required: false, example: 'fas fa-spinner' })
	@IsOptional()
	@IsString()
	icon?: string

	@ApiProperty({ description: 'Order of the next status in the workflow', required: false, example: 2 })
	@IsOptional()
	@IsInt()
	nextStatusOrder?: number

	@ApiProperty({ description: 'Order of the previous status in the workflow', required: false, example: 0 })
	@IsOptional()
	@IsInt()
	prevStatusOrder?: number
}
