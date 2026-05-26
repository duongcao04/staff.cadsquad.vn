import { ApiPropertyOptional } from '@nestjs/swagger'
import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator'
import { ClientType } from '../../../generated/prisma'

export class UpdateClientDto {
    @ApiPropertyOptional({ description: 'Tên hiển thị của khách hàng', example: 'ABC Corporation v2' })
    @IsOptional()
    @IsString()
    name?: string

    @ApiPropertyOptional({ description: 'Mã khách hàng nội bộ (slug)', example: 'ABC-CORP-V2' })
    @IsOptional()
    @IsString()
    code?: string

    @ApiPropertyOptional({ description: 'Loại khách hàng', enum: ClientType, example: ClientType.COMPANY })
    @IsOptional()
    @IsEnum(ClientType)
    type?: ClientType

    @ApiPropertyOptional({ description: 'Email liên hệ chính', example: 'new@abccorp.com' })
    @IsOptional()
    email?: string

    @ApiPropertyOptional({ description: 'Email nhận hóa đơn', example: 'billing@abccorp.com' })
    @IsOptional()
    billingEmail?: string

    @ApiPropertyOptional({ description: 'Số điện thoại liên hệ', example: '+84901234567' })
    @IsOptional()
    @IsString()
    phoneNumber?: string

    @ApiPropertyOptional({ description: 'Địa chỉ đầy đủ', example: '456 Lê Văn Việt, Q.9, TP.HCM' })
    @IsOptional()
    @IsString()
    address?: string

    @ApiPropertyOptional({ description: 'Quốc gia', example: 'VN' })
    @IsOptional()
    @IsString()
    country?: string

    @ApiPropertyOptional({ description: 'Mã số thuế', example: '0987654321' })
    @IsOptional()
    @IsString()
    taxId?: string

    @ApiPropertyOptional({ description: 'Đơn vị tiền tệ thanh toán', example: 'USD' })
    @IsOptional()
    @IsString()
    currency?: string

    @ApiPropertyOptional({ description: 'Số ngày thanh toán (Net terms)', example: 15, minimum: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    paymentTerms?: number
}
