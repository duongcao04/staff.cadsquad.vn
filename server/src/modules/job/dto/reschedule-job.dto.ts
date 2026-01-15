import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class RescheduleJobDto {
	@ApiProperty({ description: 'The original due date of the job in ISO 8601 format' })
	@IsString()
	@IsNotEmpty()
	@IsISO8601()
	fromDate: string

	@ApiProperty({ description: 'The new due date for the job in ISO 8601 format' })
	@IsString()
	@IsNotEmpty()
	@IsISO8601()
	toDate: string
}
