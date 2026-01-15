import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from "class-validator"

export class ChangeStatusDto {
	@ApiProperty({ description: 'Code of the current status' })
	@IsString()
	@IsNotEmpty()
	currentStatus: string

	@ApiProperty({ description: 'Code of the new status' })
	@IsString()
	@IsNotEmpty()
	newStatus: string
}