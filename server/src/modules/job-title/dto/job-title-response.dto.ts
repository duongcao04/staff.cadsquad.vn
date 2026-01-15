import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer'

export class JobTitleResponseDto {
	@ApiProperty({ description: 'Job Title ID' })
	@Expose()
	id: string

	@ApiProperty({ description: 'Display name of the job title' })
	@Expose()
	displayName: string

	@ApiProperty({ description: 'Optional notes for the job title', required: false })
	@Expose()
	notes?: string

	@ApiProperty({ description: 'Unique code for the job title' })
	@Expose()
	code: string

	@ApiProperty({ description: 'Creation timestamp' })
	@Expose()
	createdAt: Date

	@ApiProperty({ description: 'Last update timestamp' })
	@Expose()
	updatedAt: Date
}
