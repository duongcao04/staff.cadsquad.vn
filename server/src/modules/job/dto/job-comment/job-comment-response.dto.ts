import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { JobResponseDto } from '../job-response.dto'
import { UserResponseDto } from '../../../user/dto/user-response.dto'

export class JobCommentResponseDto {
    @ApiProperty({ description: 'Comment ID' })
    @Expose()
    id: string

    @ApiProperty({ description: 'Content of the comment' })
    @Expose()
    content: string

    @ApiProperty({ description: 'ID of the job the comment belongs to' })
    @Expose()
    jobId: string

    @ApiProperty({ type: () => JobResponseDto })
    @Expose()
    @Type(() => JobResponseDto)
    job: JobResponseDto

    @ApiProperty({ description: 'ID of the user who created the comment' })
    @Expose()
    userId: string

    @ApiProperty({ type: () => UserResponseDto })
    @Expose()
    @Type(() => UserResponseDto)
    user: string

    @ApiProperty({ description: 'ID of the parent comment', required: false })
    @Expose()
    parentId?: string

    @ApiProperty({ type: () => [JobCommentResponseDto], required: false })
    @Expose()
    @Type(() => JobCommentResponseDto)
    parent?: JobCommentResponseDto[]

    @ApiProperty({ type: () => [JobCommentResponseDto], required: false })
    @Expose()
    @Type(() => JobCommentResponseDto)
    replies?: JobCommentResponseDto[]

    @ApiProperty({ description: 'Creation timestamp' })
    @Expose()
    createdAt: Date

    @ApiProperty({ description: 'Last update timestamp' })
    @Expose()
    updatedAt: Date
}
