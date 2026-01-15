import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { UserResponseDto } from '../../user/dto/user-response.dto'

export class DepartmentResponseDto {
    @ApiProperty({ description: 'Department ID' })
    @Expose()
    id: string

    @ApiProperty({ description: 'Display name of the department' })
    @Expose()
    displayName: string

    @Expose()
    users: UserResponseDto[]

    @ApiProperty({
        description: 'Optional notes for the department',
        required: false,
    })
    @Expose()
    notes?: string

    @ApiProperty({ description: 'Unique code for the department' })
    @Expose()
    code: string

    @Expose()
    _count: any

    @ApiProperty({
        description: 'Hex color code for the department',
        required: false,
    })
    @Expose()
    hexColor?: string

    @ApiProperty({ description: 'Creation timestamp' })
    @Expose()
    createdAt: Date

    @ApiProperty({ description: 'Last update timestamp' })
    @Expose()
    updatedAt: Date
}
