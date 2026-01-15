import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { UserResponseDto } from '../../user/dto/user-response.dto'

export class GalleryResponseDto {
	@ApiProperty({ example: 'uuid-1234' })
	@Expose()
	id: string

	@ApiProperty({ example: 'Beautiful Sunset' })
	@Expose()
	title?: string

	@ApiProperty({ example: 'Taken at Bali beach' })
	@Expose()
	description?: string

	@ApiProperty({
		example: 'https://res.cloudinary.com/demo/image/upload/v1234567890/user_gallery/abc123xyz.jpg',
	})
	@Expose()
	url: string

	@ApiProperty({ example: 'Duong' })
	@Expose()
	user: UserResponseDto

	@ApiProperty({ example: 'USER_ID_123' })
	@Expose()
	userId: string

	@ApiProperty({ example: '2025-10-06T12:00:00Z' })
	@Expose()
	createdAt: Date

	@ApiProperty({ example: '2025-10-06T12:05:00Z' })
	@Expose()
	updatedAt: Date
}
