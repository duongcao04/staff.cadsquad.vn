import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator'
import { ClientType } from '../../../generated/prisma'

export class CreateClientDto {
    @ApiProperty({
        description: 'Tên hiển thị của khách hàng',
        example: 'ABC Corporation',
    })
    @IsNotEmpty()
    @IsString()
    name!: string

    @ApiProperty({
        description: 'Mã khách hàng — duy nhất, dùng để tra cứu nhanh (slug hoặc mã nội bộ)',
        example: 'ABC-CORP',
    })
    @IsNotEmpty()
    @IsString()
    code!: string

    @ApiPropertyOptional({
        description: 'Loại khách hàng: INDIVIDUAL (cá nhân) hoặc COMPANY (doanh nghiệp)',
        enum: ClientType,
        example: ClientType.COMPANY,
    })
    @IsOptional()
    @IsEnum(ClientType)
    type?: ClientType

    @ApiPropertyOptional({
        description: 'Email liên hệ chính',
        example: 'contact@abccorp.com',
    })
    @IsOptional()
    email?: string

    @ApiPropertyOptional({
        description: 'Email nhận hóa đơn (billing) — có thể khác email liên hệ',
        example: 'billing@abccorp.com',
    })
    @IsOptional()
    billingEmail?: string

    @ApiPropertyOptional({
        description: 'Số điện thoại liên hệ',
        example: '+84901234567',
    })
    @IsOptional()
    @IsString()
    phoneNumber?: string

    @ApiPropertyOptional({
        description: 'Địa chỉ đầy đủ của khách hàng',
        example: '123 Nguyễn Văn Linh, Q.7, TP.HCM',
    })
    @IsOptional()
    @IsString()
    address?: string

    @ApiPropertyOptional({
        description: 'Quốc gia (mã ISO 3166-1 alpha-2 hoặc tên quốc gia)',
        example: 'VN',
    })
    @IsOptional()
    @IsString()
    country?: string

    @ApiPropertyOptional({
        description: 'Mã số thuế doanh nghiệp',
        example: '0123456789',
    })
    @IsOptional()
    @IsString()
    taxId?: string

    @ApiPropertyOptional({
        description: 'Đơn vị tiền tệ thanh toán mặc định',
        example: 'VND',
    })
    @IsOptional()
    @IsString()
    currency?: string

    @ApiPropertyOptional({
        description: 'Số ngày thanh toán sau khi xuất hóa đơn (Net payment terms)',
        example: 30,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    paymentTerms?: number
}
