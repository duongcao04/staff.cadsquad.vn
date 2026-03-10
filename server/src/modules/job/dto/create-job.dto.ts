import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator'

export class JobAssignmentDto {
    @ApiProperty({ description: 'ID of the assigned user', example: 'uuid' })
    @IsNotEmpty()
    @IsUUID()
    userId: string

    @ApiProperty({ description: "Assignee's Staff cost for the job", example: '1000' })
    @IsNotEmpty()
    @IsString()
    staffCost: string
}

export class CreateJobDto {
    @ApiProperty({ description: 'Job number', example: 'JOB-2024-001' })
    @IsString()
    @IsNotEmpty()
    no: string

    @ApiProperty({ description: 'ID of the job type' })
    @IsUUID()
    typeId: string

    @ApiProperty({ description: 'Display name of the job' })
    @IsString()
    @IsNotEmpty()
    displayName: string

    @ApiProperty({ description: 'URLs of attachments', type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachmentUrls?: string[] // Fixed: type was string, should be string[]

    @ApiProperty({ description: 'Name of the client' })
    @IsString()
    @IsNotEmpty()
    clientName: string

    @ApiProperty({ description: 'Income cost for the job' })
    @IsString()
    incomeCost: string

    @ApiProperty({ description: 'Total Staff cost for the job' })
    @IsString()
    totalStaffCost: string

    @ApiProperty({ description: 'ID of the payment channel', required: false })
    @IsOptional()
    @IsString()
    paymentChannelId?: string

    @ApiProperty({ type: [JobAssignmentDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => JobAssignmentDto)
    jobAssignments?: JobAssignmentDto[]

    @ApiProperty({ description: 'Start date of the job', required: false })
    @IsOptional()
    @IsDateString() // Better for ISO date strings from JSON
    startedAt?: Date


    @ApiProperty({ description: 'Due date of the job' })
    @IsDateString()
    dueAt: Date

    @ApiProperty({ description: 'Whether to create SharePoint folder', required: false })
    @IsOptional()
    @IsBoolean()
    isCreateSharepointFolder?: boolean

    @ApiProperty({ description: 'ID of the SharePoint folder template', required: false })
    @IsOptional()
    @IsString()
    sharepointTemplateId?: string
}