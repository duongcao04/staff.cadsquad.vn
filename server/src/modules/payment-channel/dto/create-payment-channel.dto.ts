import { ApiProperty } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	IsUrl,
	Matches,
	IsNotEmpty,
} from 'class-validator'

export class CreatePaymentChannelDto {
	@ApiProperty({ description: 'Display name of the payment channel', example: 'Visa' })
	@IsString()
	@IsNotEmpty()
	displayName: string

	@ApiProperty({ description: 'Hex color code for the payment channel', required: false, example: '#1a1f71' })
	@IsOptional()
	@IsString()
	@Matches(/^#([0-9A-Fa-f]{6})$/, {
		message: 'hexColor must be a valid hex color code (e.g. #FFFFFF)',
	})
	hexColor?: string

	@ApiProperty({ description: 'URL of the payment channel logo', required: false, example: 'https://example.com/logo.png' })
	@IsOptional()
	@IsUrl({}, { message: 'logoUrl must be a valid URL' })
	logoUrl?: string

	@ApiProperty({ description: 'Name of the payment channel owner', required: false, example: 'John Doe' })
	@IsOptional()
	@IsString()
	ownerName?: string

	@ApiProperty({ description: 'Card number associated with the payment channel', required: false, example: '**** **** **** 1234' })
	@IsOptional()
	@IsString()
	cardNumber?: string
}
