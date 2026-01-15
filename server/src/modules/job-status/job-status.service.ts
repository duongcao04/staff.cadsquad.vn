import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { Job, JobStatus, RoleEnum } from '../../generated/prisma'
import { plainToInstance } from 'class-transformer'
import { JobStatusResponseDto } from './dto/job-status-response.dto'
import { CreateJobStatusDto } from './dto/create-job-status.dto'
import { UpdateJobStatusDto } from './dto/update-job-status.dto'
import { JobResponseDto } from '../job/dto/job-response.dto'

@Injectable()
export class JobStatusService {
	constructor(private readonly prismaService: PrismaService) {}

	/**
	 * Create a new job status.
	 */
	async create(data: CreateJobStatusDto): Promise<JobStatus> {
		const jobStatus = await this.prismaService.jobStatus.create({ data })
		return plainToInstance(JobStatusResponseDto, jobStatus, {
			excludeExtraneousValues: true,
		}) as unknown as JobStatus
	}

	/**
	 * Retrieve all job statuses.
	 */
	async findAll(): Promise<JobStatus[]> {
		// NOT Response WAIT Status -> it is temp
		const jobStatuses = await this.prismaService.jobStatus.findMany({
			orderBy: { order: 'asc' },
		})
		return jobStatuses.map((js) =>
			plainToInstance(JobStatusResponseDto, js, {
				excludeExtraneousValues: true,
			})
		) as unknown as JobStatus[]
	}

	/**
	 * Find a job status by ID.
	 */
	async findById(jobStatusId: string): Promise<JobStatus> {
		const jobStatus = await this.prismaService.jobStatus.findUnique({
			where: { id: jobStatusId },
		})

		if (!jobStatus) throw new NotFoundException('Job status not found')

		return plainToInstance(JobStatusResponseDto, jobStatus, {
			excludeExtraneousValues: true,
		}) as unknown as JobStatus
	}

	/**
	 * Find all jobs by status code :statusCode
	 */
	async findJobsByStatusCode(
		userId: string,
		userRole: RoleEnum,
		statusCode: string
	): Promise<Job[]> {
		const queryPermission =
			userRole === RoleEnum.ADMIN
				? {}
				: {
						assignee: { some: { id: userId } },
					}
		const jobs = await this.prismaService.job.findMany({
			where: {
				status: {
					code: statusCode,
				},
				...queryPermission,
			},
			include: {
				status: true,
			},
		})

		if (!jobs) throw new NotFoundException('Job not found')

		return plainToInstance(JobResponseDto, jobs, {
			excludeExtraneousValues: true,
		}) as unknown as Job[]
	}

	/**
	 * Find a job status by Order number.
	 */
	async findByOrder(orderNum: number): Promise<JobStatus> {
		const jobStatus = await this.prismaService.jobStatus.findUnique({
			where: { order: orderNum },
		})

		if (!jobStatus) throw new NotFoundException('Job status not found')

		return plainToInstance(JobStatusResponseDto, jobStatus, {
			excludeExtraneousValues: true,
		}) as unknown as JobStatus
	}

	/**
	 * Update a job status by ID.
	 */
	async update(
		jobStatusId: string,
		data: UpdateJobStatusDto
	): Promise<JobStatus> {
		try {
			const updated = await this.prismaService.jobStatus.update({
				where: { id: jobStatusId },
				data,
			})
			return plainToInstance(JobStatusResponseDto, updated, {
				excludeExtraneousValues: true,
			}) as unknown as JobStatus
		} catch (error) {
			throw new NotFoundException('Job status not found')
		}
	}

	/**
	 * Delete a job status by ID.
	 */
	async delete(jobStatusId: string): Promise<JobStatus> {
		try {
			return await this.prismaService.jobStatus.delete({
				where: { id: jobStatusId },
			})
		} catch (error) {
			throw new NotFoundException('Job status not found')
		}
	}
}
