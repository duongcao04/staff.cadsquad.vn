import { Injectable, NotFoundException } from '@nestjs/common'
import { JobType } from '../../generated/prisma'
import { plainToInstance } from 'class-transformer'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { CreateJobTypeDto } from './dto/create-job-type.dto'
import { JobTypeResponseDto } from './dto/job-type-response.dto'
import { UpdateJobTypeDto } from './dto/update-job-type.dto'

@Injectable()
export class JobTypeService {
	constructor(private readonly prismaService: PrismaService) {}

	/**
	 * Create a new job type.
	 *
	 * @param data - The data for the new job type.
	 * @returns {Promise<JobType>} The created job type object.
	 */
	async create(data: CreateJobTypeDto): Promise<JobType> {
		return this.prismaService.jobType.create({ data })
	}

	async getNextJobNo(typeId: string): Promise<string> {
		// 1. Get the Job Type to find the Prefix (e.g., "F" for Fiverr or "G" for Global)
		const jobType = await this.prismaService.jobType.findUnique({
			where: { id: typeId },
		})
		if (!jobType) throw new NotFoundException('Job Type not found')

		// 2. Find the last job created with this type
		const lastJob = await this.prismaService.job
			.findMany({
				where: { typeId },
				orderBy: { no: 'asc' },
			})
			.then((jobs) => jobs[jobs.length - 1])

		let nextSequence = 1

		if (lastJob && lastJob.no) {
			// 3. Extract the number part from the last job (Assuming format PREFIX-001)
			const lastFourDigits = lastJob.no.slice(-3)
			const lastNum = parseInt(lastFourDigits, 10)

			if (!isNaN(lastNum)) {
				nextSequence = lastNum + 1
			}
		}

		// 4. Pad the number with zeros (e.g., 1 -> 001)
		const paddedSequence = nextSequence.toString().padStart(3, '0')
		const now = new Date()
		const shortYear = now.getFullYear().toString().slice(-2)
		// 5. Return the formatted ID
		return `${jobType.code}${shortYear}${paddedSequence}`
	}

	/**
	 * Retrieve all job types.
	 *
	 * @returns {Promise<JobType[]>} List of all job types.
	 */
	async findAll(): Promise<JobType[]> {
		const jobTypes = await this.prismaService.jobType.findMany({
			include: {
				jobs: true,
				_count: {
					select: {
						jobs: {},
					},
				},
			},
		})
		return jobTypes.map((jt) =>
			plainToInstance(JobTypeResponseDto, jt, {
				excludeExtraneousValues: true,
			})
		) as unknown as JobType[]
	}

	/**
	 * Find a job type by its ID.
	 *
	 * @param jobTypeId - The ID of the job type to retrieve.
	 * @returns {Promise<JobType>} The found job type.
	 * @throws {NotFoundException} If no job type is found.
	 */
	async findById(jobTypeId: string): Promise<JobType> {
		const jobType = await this.prismaService.jobType.findUnique({
			where: { id: jobTypeId },
			include: {
				jobs: true,
				_count: {
					select: {
						jobs: {},
					},
				},
			},
		})

		if (!jobType) {
			throw new NotFoundException('Job type not found')
		}

		return plainToInstance(JobTypeResponseDto, jobType, {
			excludeExtraneousValues: true,
		}) as unknown as JobType
	}

	/**
	 * Update a job type by its ID.
	 *
	 * @param jobTypeId - The ID of the job type to update.
	 * @param data - The updated data.
	 * @returns {Promise<JobType>} The updated job type.
	 */
	async update(jobTypeId: string, data: UpdateJobTypeDto): Promise<JobType> {
		try {
			const updated = await this.prismaService.jobType.update({
				where: { id: jobTypeId },
				data,
			})
			return plainToInstance(JobTypeResponseDto, updated, {
				excludeExtraneousValues: true,
			}) as unknown as JobType
		} catch (error) {
			throw new NotFoundException('Job type not found')
		}
	}

	/**
	 * Delete a job type by its ID.
	 *
	 * @param jobTypeId - The ID of the job type to delete.
	 * @returns {Promise<JobType>} The deleted job type.
	 */
	async delete(jobTypeId: string): Promise<JobType> {
		try {
			return await this.prismaService.jobType.delete({
				where: { id: jobTypeId },
			})
		} catch (error) {
			throw new NotFoundException('Job type not found')
		}
	}
}
