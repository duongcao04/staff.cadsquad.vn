import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class RegisterUserDto {
  @ApiProperty({ description: 'First name of the user', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({ description: 'Date of birth of the user', required: false })
  @IsString()
  @IsOptional()
  dob: Date

  @ApiProperty({ description: 'Email of the user', example: 'john.doe@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: 'Password for the user', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string
}
