import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsISO8601, IsOptional } from 'class-validator'

export class AnalyticsOverviewDto {
    @ApiPropertyOptional({
        description: 'Ngày bắt đầu lọc dữ liệu (ISO 8601: YYYY-MM-DD hoặc đầy đủ UTC)',
        example: '2026-01-01',
    })
    @IsOptional()
    @IsISO8601()
    startDate?: string

    @ApiPropertyOptional({
        description: 'Ngày kết thúc lọc dữ liệu (ISO 8601)',
        example: '2026-05-31',
    })
    @IsOptional()
    @IsISO8601()
    endDate?: string

    @ApiPropertyOptional({
        description: 'Khoảng thời gian nhanh: 7d (7 ngày), 1m (1 tháng), 1y (1 năm)',
        enum: ['7d', '1m', '1y'],
        example: '1m',
    })
    @IsOptional()
    @IsEnum(['7d', '1m', '1y'])
    period?: '7d' | '1m' | '1y'
}
