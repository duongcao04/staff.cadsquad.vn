import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty()
    email: string
}

// DTO for submitting the new password
export class ResetPasswordWithTokenDto {
    @IsString()
    @IsNotEmpty()
    token: string

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    newPassword: string
}
