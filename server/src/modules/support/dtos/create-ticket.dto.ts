import {
	IsEnum,
	IsNotEmpty,
	IsString,
	MinLength,
	MaxLength,
} from 'class-validator'
import { TicketCategory } from '@/generated/prisma'

export class CreateTicketDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(5)
	@MaxLength(100)
	subject!: string

	@IsEnum(TicketCategory)
	@IsNotEmpty()
	category!: TicketCategory

	@IsString()
	@IsNotEmpty()
	@MinLength(10)
	description!: string
}

