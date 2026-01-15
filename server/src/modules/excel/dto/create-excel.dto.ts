import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ExcelColumnDto } from './excel-column.dto'

export class CreateExcelDto<T = any> {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExcelColumnDto)
    columns: ExcelColumnDto[]

    @IsArray()
    @IsNotEmpty()
    data: T[]
}
