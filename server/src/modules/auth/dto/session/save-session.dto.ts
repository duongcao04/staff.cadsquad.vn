// src/modules/auth/dto/save-session.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsIP,
    IsDateString,
    IsUUID,
} from 'class-validator'
import { TokenPayload } from '../token-payload.dto'
import { TokenResponseDto } from '../token-response.dto'

export class SaveSessionDto {
    @IsUUID()
    @IsNotEmpty()
    userId: string // ID của người dùng

    @IsString()
    @IsNotEmpty()
    device: string // Tên thiết bị (Ví dụ: Chrome on Windows)

    @IsIP()
    @IsNotEmpty()
    ipAddress: string // Địa chỉ IP người dùng

    @IsDateString()
    @IsNotEmpty()
    lastActive: string // Thời gian hoạt động cuối cùng (ISO String)

    @IsOptional()
    accessToken?: TokenResponseDto // Tùy chọn: Lưu token để hỗ trợ việc thu hồi (Revoke)
}
