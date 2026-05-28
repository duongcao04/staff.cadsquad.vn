import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'Địa chỉ email đã đăng ký tài khoản',
        example: 'john.doe@cadsquad.vn',
    })
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty()
    email: string
}

export class ResetPasswordWithTokenDto {
    @ApiProperty({
        description: 'Token đặt lại mật khẩu nhận được qua email',
        example: 'abc123def456...',
    })
    @IsString()
    @IsNotEmpty()
    token: string

    @ApiProperty({
        description: 'Mật khẩu mới (tối thiểu 8 ký tự)',
        example: 'NewPassword123!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    newPassword: string
}
