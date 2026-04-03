import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { JobTitle } from '../../generated/prisma'
import { plainToInstance } from 'class-transformer'
import { CreateJobTitleDto } from './dto/create-job-title.dto'
import { UpdateJobTitleDto } from './dto/update-job-title.dto'
import { JobTitleResponseDto } from './dto/job-title-response.dto'

@Injectable()
export class JobTitleService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(data: CreateJobTitleDto): Promise<JobTitle> {
		const jobTitle = await this.prismaService.jobTitle.create({ data })
		return plainToInstance(JobTitleResponseDto, jobTitle, {
			excludeExtraneousValues: true,
		}) as unknown as JobTitle
	}

	async findAll(): Promise<JobTitle[]> {
		const jobTitles = await this.prismaService.jobTitle.findMany({
			include: { _count: { select: { users: true } }, users: true },
			orderBy: {
				displayName: 'asc',
			},
		})
		return jobTitles.map((jt) =>
			plainToInstance(JobTitleResponseDto, jt, {
				excludeExtraneousValues: true,
			})
		) as unknown as JobTitle[]
	}

	async findById(id: string): Promise<JobTitle> {
		const jobTitle = await this.prismaService.jobTitle.findUnique({
			where: { id },
			include: { _count: { select: { users: true } }, users: true },
		})
		if (!jobTitle) throw new NotFoundException('Job title not found')
		return plainToInstance(JobTitleResponseDto, jobTitle, {
			excludeExtraneousValues: true,
		}) as unknown as JobTitle
	}

	async findByCode(code: string): Promise<JobTitle> {
		const jobTitle = await this.prismaService.jobTitle.findUnique({
			where: { code },
			include: { _count: { select: { users: true } }, users: true },
		})
		if (!jobTitle) throw new NotFoundException('Job title not found')
		return plainToInstance(JobTitleResponseDto, jobTitle, {
			excludeExtraneousValues: true,
		}) as unknown as JobTitle
	}

	async update(id: string, data: UpdateJobTitleDto): Promise<JobTitle> {
		try {
			const updated = await this.prismaService.jobTitle.update({
				where: { id },
				data,
			})
			return plainToInstance(JobTitleResponseDto, updated, {
				excludeExtraneousValues: true,
			}) as unknown as JobTitle
		} catch (error) {
			throw new NotFoundException('Job title not found')
		}
	}

	async delete(id: string): Promise<JobTitle> {
		try {
			return await this.prismaService.jobTitle.delete({ where: { id } })
		} catch (error) {
			throw new NotFoundException('Job title not found')
		}
	}
}

