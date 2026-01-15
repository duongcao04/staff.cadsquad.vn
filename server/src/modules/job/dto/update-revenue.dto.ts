import { IsOptional, IsString, IsUUID } from 'class-validator'

export class UpdateRevenueDto {
    @IsString()
    @IsOptional()
    incomeCost: string

    @IsUUID()
    @IsOptional()
    paymentChannelId: string
}
