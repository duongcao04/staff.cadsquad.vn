import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class UpdatePasswordDto {
	@ApiProperty({ description: 'The current password of the user', example: 'oldPassword123' })
	@IsString()
	@IsNotEmpty({ message: 'Old password is required' })
	oldPassword: string

	@ApiProperty({ description: 'The new password for the user', example: 'newPassword123' })
	@IsString()
	@IsNotEmpty({ message: 'New password is required' })
	@Matches(
		/^.{8,}$/,
		{
			message:
				'Password must be at least 8 characters long',
		},
	)
	newPassword: string

	@ApiProperty({ description: 'Confirmation of the new password', example: 'newPassword123' })
	@IsString()
	@IsNotEmpty({ message: 'Confirm new password is required' })
	newConfirmPassword: string
}
