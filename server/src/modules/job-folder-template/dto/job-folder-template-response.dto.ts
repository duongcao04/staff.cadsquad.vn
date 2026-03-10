import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer'

export class JobFolderTemplateResponseDto {
	@ApiProperty({ description: 'Job Folder Template ID' })
	@Expose()
	id: string

	@ApiProperty({ description: 'Display name of the job folder template' })
	@Expose()
	displayName: string

	@ApiProperty({ description: 'Folder ID from the storage system' })
	@Expose()
	folderId: string

	@ApiProperty({ description: 'Folder name' })
	@Expose()
	folderName: string

	@ApiProperty({ description: 'Size of the folder in bytes' })
	@Expose()
	size: number

	@ApiProperty({ description: 'Web URL to access the folder' })
	@Expose()
	webUrl: string

	@ApiProperty({ description: 'Creation timestamp' })
	@Expose()
	createdAt: Date

	@ApiProperty({ description: 'Last update timestamp' })
	@Expose()
	updatedAt: Date
}