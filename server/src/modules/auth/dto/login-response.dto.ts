import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { TokenResponseDto } from './token-response.dto'

export class LoginResponseDto {
    @ApiProperty({ type: () => TokenResponseDto })
    @Expose()
    @Type(() => TokenResponseDto)
    accessToken: TokenResponseDto
}
