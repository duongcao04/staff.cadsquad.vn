import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class ExcelColumnDto {
    @IsString()
    @IsNotEmpty()
    header: string

    @IsString()
    @IsNotEmpty()
    key: string

    @IsOptional()
    @IsNumber()
    width?: number
}
