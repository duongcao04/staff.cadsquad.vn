import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { PermissionResponseDto } from './permission-response.dto'
import { UserResponseDto } from '../../user/dto/user-response.dto'

export class RoleResponseDto {
    @ApiProperty({ description: 'ID của vai trò' })
    @Expose()
    id: string

    @ApiProperty({ description: 'Tên hiển thị', example: 'Quản trị viên' })
    @Expose()
    displayName: string

    @ApiProperty({ description: 'Mã vai trò', example: 'ADMIN' })
    @Expose()
    code: string

    @ApiProperty({
        description: 'Màu sắc đại diện (Hex)',
        required: false,
        example: '#FF0000',
    })
    @Expose()
    hexColor?: string

    @ApiProperty({
        type: [PermissionResponseDto],
        description: 'Danh sách các quyền thuộc vai trò này',
    })
    @Expose()
    @Type(() => PermissionResponseDto)
    permissions: PermissionResponseDto[]

    @Expose()
    @Type(() => UserResponseDto)
    users: UserResponseDto[]

    @ApiProperty({ description: 'Ngày tạo' })
    @Expose()
    createdAt: Date

    @ApiProperty({ description: 'Ngày cập nhật' })
    @Expose()
    updatedAt: Date
}
