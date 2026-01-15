import {
	IsString,
	IsEnum,
	IsEmail,
	IsOptional,
	IsNumber,
	Min,
} from 'class-validator'
import { ClientType } from '../../../generated/prisma'

export class UpdateClientDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsString()
	code?: string

	@IsOptional()
	@IsEnum(ClientType)
	type?: ClientType

	@IsOptional()
	@IsEmail()
	email?: string

	@IsOptional()
	@IsEmail()
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
