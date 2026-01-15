import { ApiProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"

export class TokenResponseDto {
	@ApiProperty({ description: 'Token string' })
	@Expose()
	token: string

	@ApiProperty({ description: 'Expiration timestamp in seconds' })
	@Expose()
	expiresAt: number
}
