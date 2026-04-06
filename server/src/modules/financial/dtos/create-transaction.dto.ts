import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { TransactionStatus, TransactionType } from '../../../generated/prisma'

export class CreateTransactionDto {
	@IsNumber()
	amount!: number

	@IsString()
	@IsOptional()
	currency?: string

	@IsEnum(TransactionType)
	type!: TransactionType

	@IsEnum(TransactionStatus)
	@IsOptional()
	status?: TransactionStatus

	@IsString()
	@IsOptional()
	referenceNo?: string

	@IsString()
	@IsOptional()
	note?: string

	@IsString()
	@IsOptional()
	evidenceUrl?: string

	@IsUUID()
	jobId!: string

	@IsUUID()
	@IsOptional()
	clientId?: string

	@IsUUID()
	@IsOptional()
	assignmentId?: string

	@IsUUID()
	@IsOptional()
	paymentChannelId?: string
}
