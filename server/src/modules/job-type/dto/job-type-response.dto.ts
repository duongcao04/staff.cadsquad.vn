import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { JobResponseDto } from '../../job/dto/job-response.dto'

export class JobTypeResponseDto {
	@ApiProperty({ description: 'Job Type ID' })
	@Expose()
	id: string

	@ApiProperty({ description: 'Code of the job type' })
	@Expose()
	code: string

	@ApiProperty({ description: 'Display name of the job type' })
	@Expose()
	displayName: string

	@ApiProperty({ description: 'Hex color of the job type', required: false })
	@Expose()
	hexColor?: string

	@ApiProperty({ type: () => [JobResponseDto], required: false })
	@Expose()
	@Type(() => JobResponseDto)
	jobs?: JobResponseDto[]

	@ApiProperty({ description: 'Count of related entities' })
	@Expose()
	_count: Record<string, unknown>
}
