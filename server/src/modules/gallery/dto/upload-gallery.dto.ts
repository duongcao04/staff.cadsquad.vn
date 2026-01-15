import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UploadGalleryDto {
	@ApiProperty({
		required: false,
		example: 'Beach Sunset',
		description: 'Title of the gallery item',
	})
	@IsOptional()
	@IsString()
	title?: string

	@ApiProperty({ example: 'Taken at Bali beach', description: 'Description of the gallery item', required: false })
	@IsOptional()
	@IsString()
	description?: string

	@ApiProperty({ example: 'Cadsquad/user_gallery', required: false })
	@IsOptional()
	@IsString()
	folder?: string
}
