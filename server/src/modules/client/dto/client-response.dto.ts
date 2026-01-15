import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { ClientType } from '../../../generated/prisma'

// The base Client Type
export class ClientResponseDto {
	@ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
	@Expose()
	id: string

	@ApiProperty({ description: 'Tên định danh duy nhất (Case-insensitive)' })
	@Expose()
	name: string

	@ApiProperty({ example: 'CSD-A0B1C' })
	@Expose()
	code: string

	@ApiProperty({ enum: ClientType, example: 'COMPANY' })
	@Expose()
	type: ClientType

	@ApiProperty({ example: 'billing@apple.com', required: false })
	@Expose()
	email?: string

	@ApiProperty({ example: '+1-555-0123', required: false })
	@Expose()
	phoneNumber?: string

	@ApiProperty({
		example: { jobs: 5 },
		required: false,
		description: 'Relational counts',
	})
	_count?: {
		jobs: number
	}
}
