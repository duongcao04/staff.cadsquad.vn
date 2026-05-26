import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsString,
	IsOptional,
	IsUrl,
	MaxLength,
	IsArray,
	IsNotEmpty,
	ValidateNested,
} from 'class-validator'

export class DeliverJobFileDto {
	@ApiProperty({
		description: 'URL công khai của file trên SharePoint',
		example: 'https://cadsquad.sharepoint.com/sites/...',
	})
	@IsUrl({}, { message: 'Each attachment must be a valid URL' })
	@IsNotEmpty()
	webUrl!: string

	@ApiProperty({ description: 'Tên hiển thị của file', example: 'design-v2.fig' })
	@IsString()
	@IsNotEmpty()
	fileName!: string

	@ApiProperty({
		description: 'ID của file trên SharePoint (dùng để xoá/cập nhật)',
		example: 'sp-item-id-123',
	})
	@IsString()
	@IsNotEmpty()
	sharepointId!: string
}

export class DeliverJobDto {
	@ApiProperty({
		description: 'Ghi chú bàn giao: mô tả công việc đã làm, link Figma, hướng dẫn, v.v.',
		example: 'Đã hoàn thành thiết kế theo brief. Link Figma: https://figma.com/...',
		maxLength: 1000,
	})
	@IsString()
	@MaxLength(1000, { message: 'Note is too long (max 1000 chars)' })
	@IsNotEmpty({ message: 'A delivery note is required' })
	note!: string

	@ApiProperty({
		description: 'Link kết quả công việc (Figma, Drive, v.v.) nếu không upload file',
		example: 'https://www.figma.com/file/abc123',
		required: false,
	})
	@IsOptional()
	@IsUrl({}, { message: 'Link must be a valid URL' })
	link?: string

	@ApiProperty({
		description: 'Danh sách file đính kèm đã upload lên SharePoint',
		type: [DeliverJobFileDto],
		required: false,
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => DeliverJobFileDto)
	files?: DeliverJobFileDto[]
}
