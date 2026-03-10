import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsUrl } from 'class-validator'

export class CreateJobFolderTemplateDto {
	@ApiProperty({ description: 'Display name of the job folder template', example: 'Design Templates' })
	@IsString()
	@IsNotEmpty()
	displayName: string

	@ApiProperty({ description: 'Folder ID from the storage system', example: 'folder-123' })
	@IsString()
	@IsNotEmpty()
	folderId: string

	@ApiProperty({ description: 'Folder name', example: 'Templates' })
	@IsString()
	@IsNotEmpty()
	folderName: string

	@ApiProperty({ description: 'Size of the folder in bytes', example: 1024 })
	@IsInt()
	size: number

	@ApiProperty({ description: 'Web URL to access the folder', example: 'https://example.com/folder' })
	@IsString()
	@IsUrl()
	webUrl: string
}