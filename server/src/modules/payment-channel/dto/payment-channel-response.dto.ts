import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { PaymentChannelType } from '../../../generated/prisma'

export class PaymentChannelResponseDto {
	@ApiProperty({ description: 'Payment Channel ID' })
	@Expose()
	id!: string

	@ApiProperty({ description: 'Display name of the payment channel' })
	@Expose()
	displayName!: string

	@ApiProperty({ description: 'Hex color of the payment channel', required: false })
	@Expose()
	hexColor?: string

	@Expose()
	type?: PaymentChannelType

	@Expose()
	accountDetails?: string

	@Expose()
	feeRate?: number

	@Expose()
	isActive!: boolean

	@Expose()
	fixedFee?: number

	@Expose()
	totalVolume?: number

	@Expose()
	totalFees?: number

	@ApiProperty({ description: 'URL of the logo', required: false })
	@Expose()
	logoUrl?: string

	@ApiProperty({ description: 'Name of the owner', required: false })
	@Expose()
	ownerName?: string

	@ApiProperty({ description: 'Card number', required: false })
	@Expose()
	cardNumber?: string
}
