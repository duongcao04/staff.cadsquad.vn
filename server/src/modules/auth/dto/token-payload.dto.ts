import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { RoleResponseDto } from '../../role-permissions/dtos/role-response.dto'
import { PermissionResponseDto } from '../../role-permissions/dtos/permission-response.dto'

export class TokenPayload {
	@ApiProperty({ description: 'User ID (subject)' })
	@Expose()
	sub!: string

	@ApiProperty({ description: 'User email' })
	@Expose()
	email!: string

	@ApiProperty({ description: 'User code' })
	@Expose()
	code!: string

	@ApiProperty({ description: 'User role', type: RoleResponseDto })
	@Expose()
	role!: RoleResponseDto

	@ApiProperty({ description: 'User role', type: [String] })
	@Expose()
	permissions!: string[]

	@ApiProperty({ description: 'Issued at timestamp' })
	@Expose()
	iat!: string
}
