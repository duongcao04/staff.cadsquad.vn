import { ApiProperty } from '@nestjs/swagger'
import {
	IsString,
	IsOptional,
	IsPhoneNumber,
	MinLength,
	MaxLength,
	IsUrl,
	IsEmail,
} from 'class-validator'

export class UpdateProfileDto {
	@ApiProperty({
		description: 'Tên hiển thị của người dùng',
		example: 'Nguyễn Văn A',
		required: false,
	})
	@IsString()
	@IsOptional()
	@MinLength(2, { message: 'Tên hiển thị phải có ít nhất 2 ký tự' })
	@MaxLength(50, { message: 'Tên hiển thị không được vượt quá 50 ký tự' })
	displayName?: string

	@ApiProperty({
		description: 'URL ảnh đại diện',
		example: 'https://api.cadsquad.com/storage/avatars/user-1.jpg',
		required: false,
	})
	@IsString()
	@IsUrl({}, { message: 'Định dạng URL ảnh đại diện không hợp lệ' })
	@IsOptional()
	avatar?: string

	@ApiProperty({
		description: 'Số điện thoại liên lạc',
		example: '+84901234567',
		required: false,
	})
	@IsString()
	@IsOptional()
	@IsPhoneNumber(undefined, { message: 'Số điện thoại không đúng định dạng' })
	phoneNumber?: string

	@ApiProperty({
		description: 'Email cá nhân (để nhận thông báo, khôi phục, v.v.)',
		example: 'personal@gmail.com',
		required: false,
	})
	@IsString()
	@IsOptional()
	@IsEmail({}, { message: 'Email cá nhân không đúng định dạng' })
	personalEmail?: string
}
