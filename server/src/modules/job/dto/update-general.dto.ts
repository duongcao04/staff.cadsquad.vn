import { IsString, IsOptional, IsDateString } from 'class-validator'

export class UpdateGeneralJobDto {
    @IsOptional()
    @IsString()
    displayName?: string

    @IsOptional()
    @IsString()
    clientName?: string

    @IsOptional()
    @IsDateString()
    startedAt?: Date

    @IsOptional()
    @IsDateString()
    dueAt?: Date

    @IsOptional()
    @IsString()
    description?: string
}
