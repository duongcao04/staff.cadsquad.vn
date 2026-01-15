import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UploadResponseDto {
	@Expose()
	@ApiProperty({
		description: 'Unique identifier of the file/folder',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	id: string;

	@Expose()
	@ApiProperty({
		description: 'Name of the file or folder',
		example: 'contract_v1.pdf',
	})
	name: string;

	@Expose()
	@ApiProperty({
		description: 'MIME type or "folder"',
		example: 'application/pdf',
	})
	type: string;

	@Expose()
	@ApiProperty({
		description: 'Size of the file (as string per database schema)',
		example: '2.5 MB',
	})
	size: string;

	@Expose()
	@ApiProperty({
		description: 'Number of items (if it is a folder)',
		example: 5,
		nullable: true,
		required: false,
	})
	items: number | null;

	@Expose()
	@ApiProperty({
		description: 'Breadcrumb or directory path',
		example: ['documents', 'contracts', '2023'],
		type: [String],
	})
	path: string[];

	@Expose()
	@ApiProperty({
		description: 'Color tag for UI display',
		example: '#FF5733',
		nullable: true,
		required: false,
	})
	color: string | null;

	@Expose()
	@ApiProperty({
		description: 'ID of the user who uploaded the file',
		example: 'user-uuid-123',
	})
	createdById: string;

	@Expose()
	@ApiProperty({
		description: 'Associated Job ID (if any)',
		example: 'job-uuid-999',
		nullable: true,
		required: false,
	})
	jobId: string | null;

	@Expose()
	@ApiProperty({
		description: 'Upload timestamp',
		example: '2023-10-27T07:00:00.000Z',
	})
	createdAt: Date;

	@Expose()
	@ApiProperty({
		description: 'Last modification timestamp',
		example: '2023-10-27T07:00:00.000Z',
	})
	updatedAt: Date;

	/**
	 * OPTIONAL: If you want to return a full URL constructed from the path/name
	 * You can use @Transform.
	 * Remove this if you handle URLs differently (e.g., presigned URLs).
	 */
	/*
	@Expose()
	@ApiProperty({ description: 'Full access URL', example: 'https://cdn.example.com/...' })
	@Transform(({ obj }) => `https://cdn.myapp.com/${obj.path.join('/')}/${obj.name}`)
	url: string;
	*/

	constructor(partial: Partial<UploadResponseDto>) {
		Object.assign(this, partial);
	}
}