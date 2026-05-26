import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID } from 'class-validator'

export class UpdateRevenueDto {
    @ApiPropertyOptional({
        description: 'Doanh thu của job (số tiền nhận từ client, đơn vị VND)',
        example: '15000000',
    })
    @IsString()
    @IsOptional()
    incomeCost: string

    @ApiPropertyOptional({
        description: 'ID kênh thanh toán dùng để nhận tiền (bank, ví điện tử, v.v.)',
        example: 'uuid-of-payment-channel',
    })
    @IsUUID()
    @IsOptional()
    paymentChannelId: string
}
