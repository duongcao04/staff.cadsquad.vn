import { Type } from 'class-transformer'
import {
    IsString,
    IsOptional,
    IsUrl,
    MaxLength,
    IsArray,
    IsNotEmpty,
    ValidateNested,
} from 'class-validator'

export class DeliverJobFileDto {
    @IsUrl({}, { message: 'Each attachment must be a valid URL' })
    @IsNotEmpty()
    webUrl!: string

    @IsString()
    @IsNotEmpty()
    fileName!: string

    @IsString()
    @IsNotEmpty()
    sharepointId!: string
}

export class DeliverJobDto {
    @IsString()
    @MaxLength(1000, { message: 'Note is too long (max 1000 chars)' })
    @IsNotEmpty({ message: 'A delivery note is required' })
    note: string

    @IsOptional()
    @IsUrl({}, { message: 'Link must be a valid URL' })
    link?: string

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeliverJobFileDto)
    files?: DeliverJobFileDto[]
}