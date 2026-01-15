import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class ResetPasswordDto {
    @ApiProperty({
        description: 'The new password for the user',
        example: 'newPassword123',
    })
    @IsString()
    @IsNotEmpty({ message: 'New password is required' })
    @Matches(/^.{8,}$/, {
        message: 'Password must be at least 8 characters long',
    })
    newPassword: string
}
