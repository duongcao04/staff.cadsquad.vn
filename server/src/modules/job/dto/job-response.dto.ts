import { ApiProperty } from '@nestjs/swagger'
import { APP_PERMISSIONS } from '@/utils'
import { Expose, Type } from 'class-transformer'
import { Client } from 'pg'
import { JobAssignment } from '../../../generated/prisma'
import { JobFolderTemplateResponseDto } from '../../job-folder-template/dto/job-folder-template-response.dto'
import { JobStatusResponseDto } from '../../job-status/dto/job-status-response.dto'
import { JobTypeResponseDto } from '../../job-type/dto/job-type-response.dto'
import { PaymentChannelResponseDto } from '../../payment-channel/dto/payment-channel-response.dto'
import { UserResponseDto } from '../../user/dto/user-response.dto'
import { JobCommentResponseDto } from './job-comment/job-comment-response.dto'

export class JobResponseDto {
	@ApiProperty({ description: 'Job ID' })
	@Expose()
	id!: string

	@ApiProperty({ description: 'Job number' })
	@Expose()
	no!: string

	@ApiProperty({ description: 'Display name of the job' })
	@Expose()
	displayName!: string

	@ApiProperty({ description: 'URL of the job thumbnail' })
	@Expose()
	thumbnailUrl!: string

	@ApiProperty({ description: 'Description of the job', required: false })
	@Expose()
	description?: string

	@ApiProperty({ description: 'Source URL of the job', required: false })
	@Expose()
	sourceUrl?: string

	@ApiProperty({ description: 'The client' })
	@Expose()
	client!: Client

	@ApiProperty({ description: 'Income cost of the job' })
	@Expose({ groups: [APP_PERMISSIONS.JOB.READ_INCOME] })
	incomeCost!: number

	@ApiProperty({ description: 'Total staff cost of the job' })
	@Expose({ groups: [APP_PERMISSIONS.JOB.READ_STAFF_COST] })
	totalStaffCost!: number

	@ApiProperty({ description: 'Staff cost of the job' })
	@Expose()
	staffCost!: number

	@ApiProperty({ description: 'Whether the job is pinned' })
	@Expose()
	isPinned!: boolean

	@ApiProperty({ description: 'Whether the job is published' })
	@Expose()
	isPublished!: boolean

	@ApiProperty({ description: 'Whether the job is paid' })
	@Expose()
	isPaid!: boolean

	@ApiProperty({ description: 'URLs of attachments', type: [String] })
	@Expose()
	attachmentUrls!: string[]

	@ApiProperty({ description: 'Linked SharePoint folder ID', required: false })
	@Expose()
	sharepointFolderId?: string


	@Expose()
	sharepointFolder?: any

	@ApiProperty({ description: 'Start date of the job' })
	@Expose()
	startedAt!: Date

	@ApiProperty({ description: 'Due date of the job' })
	@Expose()
	dueAt!: Date

	@ApiProperty({ description: 'Completion date of the job', required: false })
	@Expose()
	completedAt?: Date

	@ApiProperty({ description: 'Finish date of the job', required: false })
	@Expose()
	finishedAt?: Date

	@ApiProperty({ description: 'Paid date of the job', required: false })
	@Expose()
	payoutDate?: Date

	@ApiProperty({ description: 'Deletion date of the job', required: false })
	@Expose()
	deletedAt?: Date

	@ApiProperty({ description: 'Creation date of the job' })
	@Expose()
	createdAt!: Date

	@ApiProperty({ description: 'Last update date of the job' })
	@Expose()
	updatedAt!: Date

	@ApiProperty({ type: () => UserResponseDto })
	@Expose()
	@Type(() => UserResponseDto)
	createdBy!: UserResponseDto

	folderTemplateId?: string

	folderTemplate?: JobFolderTemplateResponseDto

	@Expose()
	assignments!: JobAssignment[]

	@Expose()
	jobDeliveries: unknown

	@ApiProperty({ type: () => JobCommentResponseDto })
	@Expose()
	@Type(() => JobCommentResponseDto)
	comments!: JobCommentResponseDto

	@ApiProperty({ type: () => JobTypeResponseDto })
	@Expose()
	@Type(() => JobTypeResponseDto)
	type!: JobTypeResponseDto

	@ApiProperty({ type: () => PaymentChannelResponseDto })
	@Expose()
	@Type(() => PaymentChannelResponseDto)
	paymentChannel!: PaymentChannelResponseDto

	@ApiProperty({ type: () => JobStatusResponseDto })
	@Expose()
	@Type(() => JobStatusResponseDto)
	status!: JobStatusResponseDto
}
