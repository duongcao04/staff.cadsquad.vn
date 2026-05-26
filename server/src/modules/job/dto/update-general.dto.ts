import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsDateString } from 'class-validator'

export class UpdateGeneralJobDto {
    @ApiPropertyOptional({ description: 'Tên hiển thị của job', example: 'Thiết kế logo ABC Corp v2' })
    @IsOptional()
    @IsString()
    displayName?: string

    @ApiPropertyOptional({ description: 'ID của client mới', example: 'uuid-of-client' })
    @IsOptional()
    @IsString()
    clientId?: string

    @ApiPropertyOptional({ description: 'Ngày bắt đầu (ISO 8601)', example: '2026-06-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    startedAt?: Date

    @ApiPropertyOptional({ description: 'Deadline mới (ISO 8601)', example: '2026-06-30T23:59:59.000Z' })
    @IsOptional()
    @IsDateString()
    dueAt?: Date

    @ApiPropertyOptional({ description: 'Mô tả chi tiết công việc', example: 'Redesign logo theo brand guideline 2026' })
    @IsOptional()
    @IsString()
    description?: string
}
