import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from "class-validator"

export class BulkChangeStatusDto {
	@ApiProperty({ description: 'An array of job IDs to update' })
	@IsArray()
	@IsNotEmpty()
	jobIds: string[]

	@ApiProperty({ description: 'The ID of the new status to apply to the jobs' })
	@IsString()
	@IsNotEmpty()
	toStatusId: string
}