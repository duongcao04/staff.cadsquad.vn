import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class PaymentChannelResponseDto {
	@ApiProperty({ description: 'Payment Channel ID' })
	@Expose()
	id: string

	@ApiProperty({ description: 'Display name of the payment channel' })
	@Expose()
	displayName: string

	@ApiProperty({ description: 'Hex color of the payment channel', required: false })
	@Expose()
	hexColor?: string

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
