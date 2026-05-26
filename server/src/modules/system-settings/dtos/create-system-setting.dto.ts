import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateSystemSettingDto {
    @ApiProperty({
        description: 'Khóa định danh duy nhất cho setting (snake_case)',
        example: 'company_name',
    })
    @IsString()
    @IsNotEmpty()
    key!: string

    @ApiProperty({
        description: 'Giá trị của setting, lưu dưới dạng JSON stringified',
        example: '"Cadsquad Design Studio"',
    })
    @IsString()
    @IsNotEmpty()
    value!: string
}
