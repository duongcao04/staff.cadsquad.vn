import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class SendEmailDto {
    @IsNotEmpty()
    to: string | string[]

    @IsOptional()
    @IsArray()
    cc?: string[]

    @IsOptional()
    @IsArray()
    bcc?: string[]

    @IsOptional()
    @IsString()
    fromName?: string

    @IsString()
    @IsOptional()
    fromEmail?: string

    @IsString()
    @IsNotEmpty()
    subject: string

    @IsString()
    @IsNotEmpty()
    content: string
}
