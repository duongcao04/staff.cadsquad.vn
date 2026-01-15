import { IsString, IsBoolean, IsOptional } from 'class-validator'

export class CreateUserDeviceDto {
    @IsString()
    token: string

    @IsString()
    type: string // e.g., 'WEB', 'IOS', 'ANDROID'
}
