import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { UserResponseDto } from '../../user/dto/user-response.dto'

@Exclude() // 1. Whitelist strategy: Exclude all properties by default
export class UserConfigResponseDto {
    @Expose()
    @ApiProperty({
        description: 'The unique identifier of the configuration',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id: string

    @Expose()
    @ApiProperty({
        description: 'The ID of the user who owns this config (can be null)',
        example: 'user-uuid-123',
        nullable: true,
        required: false,
    })
    userId: string | null

    @Expose()
    @Type(() => UserResponseDto)
    @ApiProperty({ type: () => UserResponseDto })
    user?: UserResponseDto

    @Expose()
    @ApiProperty({
        description: 'The display name of the configuration (human-readable)',
        example: 'Dark Mode',
    })
    displayName: string

    @Expose()
    @ApiProperty({
        description:
            'The unique configuration code/key (used in business logic)',
        example: 'THEME_MODE',
    })
    code: string

    @Expose()
    @ApiProperty({
        description: 'The value of the configuration',
        example: 'DARK',
    })
    value: string

    @Expose()
    @ApiProperty({
        description: 'The timestamp when the config was created',
        example: '2023-10-27T07:00:00.000Z',
    })
    createdAt: Date

    @Expose()
    @ApiProperty({
        description: 'The timestamp when the config was last updated',
        example: '2023-10-28T08:30:00.000Z',
    })
    updatedAt: Date
}
