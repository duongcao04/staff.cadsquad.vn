import {
    IsString,
    IsOptional,
    IsUrl,
    MaxLength,
    IsArray,
    IsNotEmpty,
} from 'class-validator'

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
    @IsString({ each: true })
    files?: string[]
}
