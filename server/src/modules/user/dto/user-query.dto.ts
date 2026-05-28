import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class UserQueryDto {
	@ApiPropertyOptional({ description: 'Số trang (bắt đầu từ 1)', example: 1, default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number

	@ApiPropertyOptional({ description: 'Số bản ghi mỗi trang (tối đa 100)', example: 10, default: 10 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number

	@ApiPropertyOptional({ description: 'Tìm kiếm theo tên, email hoặc username', example: 'john' })
	@IsOptional()
	@IsString()
	search?: string

	@ApiPropertyOptional({ description: 'Lọc theo ID phòng ban', example: 'uuid-of-department' })
	@IsOptional()
	@IsString()
	departmentId?: string

	@ApiPropertyOptional({ description: 'Lọc theo code của role (ví dụ: ADMIN, STAFF)', example: 'STAFF' })
	@IsOptional()
	@IsString()
	role?: string
}
