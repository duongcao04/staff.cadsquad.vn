import { ApiProperty } from '@nestjs/swagger'
import {
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator'
import { TicketCategory } from '@/generated/prisma'

export class CreateTicketDto {
    @ApiProperty({
        description: 'Tiêu đề ngắn gọn mô tả vấn đề cần hỗ trợ (5–100 ký tự)',
        example: 'Không thể đăng nhập vào hệ thống',
        minLength: 5,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(100)
    subject!: string

    @ApiProperty({
        description: 'Phân loại ticket hỗ trợ',
        enum: TicketCategory,
        example: TicketCategory.TECHNICAL,
    })
    @IsEnum(TicketCategory)
    @IsNotEmpty()
    category!: TicketCategory

    @ApiProperty({
        description: 'Mô tả chi tiết vấn đề, bước tái hiện lỗi, ảnh hưởng (tối thiểu 10 ký tự)',
        example: 'Khi đăng nhập bằng email công ty, hệ thống trả về lỗi 401. Tài khoản vẫn còn hiệu lực.',
        minLength: 10,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    description!: string
}
