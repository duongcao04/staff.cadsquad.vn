import {
	IsString,
	IsEnum,
	IsEmail,
	IsOptional,
	IsNumber,
	Min,
	IsNotEmpty,
} from 'class-validator'
import { ClientType } from '../../../generated/prisma'

export class CreateClientDto {
	@IsNotEmpty()
	@IsString()
	name!: string

	@IsNotEmpty()
	@IsString()
	code!: string

	@IsOptional()
	@IsEnum(ClientType)
	type?: ClientType

	@IsOptional()
	email?: string

	@IsOptional()
	billingEmail?: string

	@IsOptional()
	@IsString()
	phoneNumber?: string

	@IsOptional()
	@IsString()
	address?: string

	@IsOptional()
	@IsString()
	country?: string

	@IsOptional()
	@IsString()
	taxId?: string

	@IsOptional()
	@IsString()
	currency?: string

	@IsOptional()
	@IsNumber()
	@Min(0)
	paymentTerms?: number
}
