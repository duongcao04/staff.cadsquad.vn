import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator'

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    displayName: string

    @IsString()
    @IsOptional()
    hexColor: string

    @IsArray()
    @IsString({ each: true }) // Ensures every item in array is a Number
    permissionIds: string[]
}
