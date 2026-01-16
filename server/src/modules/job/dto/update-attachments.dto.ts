import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsString, ArrayMinSize } from 'class-validator'

export class UpdateAttachmentsDto {
	@ApiProperty({ enum: ['add', 'remove'], example: 'add' })
	@IsEnum(['add', 'remove'])
	action: 'add' | 'remove'

	@ApiProperty({ type: [String], example: ['https://cloud.com/file1.pdf'] })
	@IsArray()
	@IsString({ each: true })
	@ArrayMinSize(1) // Don't allow empty requests
	files: string[]
}
