import { Prisma } from '@/generated/prisma'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Job } from 'bullmq'
import { plainToInstance } from 'class-transformer'
import { JobFiltersBuilder } from '../../dto/job-filters.dto'
import { JobQueryBuilder, JobQueryDto } from '../../dto/job-query.dto'
import { JobResponseDto } from '../../dto/job-response.dto'
import { JobSortBuilder } from '../../dto/job-sort.dto'
import { JobHelpersService } from '../../job-helpers.service'

export class FindAllJobsQuery {
	constructor(
		public readonly userId: string,
		public readonly userPermissions: string[],
		public readonly queryDto: JobQueryDto
	) {}
}

@QueryHandler(FindAllJobsQuery)
export class FindAllJobsHandler implements IQueryHandler<FindAllJobsQuery> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jobHelpers: JobHelpersService
	) {}

	async execute(query: FindAllJobsQuery) {
		const { userId, userPermissions, queryDto } = query

		const {
			tab,
			hideFinishedJobs,
			page = 1,
			limit = 10,
			search,
			sort = 'createdAt:desc',
			isAll,
			...filters
		} = queryDto

		const filtersQuery = JobFiltersBuilder.build(filters)
		const orderBy = JobSortBuilder.build(sort)
		const tabQuery = JobQueryBuilder.buildQueryTab(tab)
		const searchQuery = JobQueryBuilder.buildSearch(search, [
			'no',
			'displayName',
		])

		const userPermission = await this.jobHelpers.buildPermission(userId)
		const queryBuilder: Prisma.JobWhereInput = {
			AND: [
				userPermission,
				tabQuery,
				filtersQuery,
				{
					...(hideFinishedJobs && {
						status: {
							isNot: { systemType: 'TERMINATED' },
						},
					}),
				},
				searchQuery,
			],
		}

		console.log({
			...(hideFinishedJobs && {
				status: {
					isNot: { systemType: 'TERMINATED' },
				},
			}),
		})

		const [rawData, total] = await Promise.all([
			this.prisma.job.findMany({
				where: queryBuilder,
				orderBy,
				take: isAll ? undefined : Number(limit),
				skip: isAll ? undefined : (Number(page) - 1) * Number(limit),
				include: {
					type: true,
					status: true,
					paymentChannel: true,
					client: { select: { name: true } },
					assignments: { include: { user: true } },
					folderTemplate: true,
					sharepointFolder: true,
				},
			}),
			this.prisma.job.count({ where: queryBuilder }),
		])

		const mappedData = await this.jobHelpers.mapRoleBasedData(
			rawData,
			userId
		)
		const result = plainToInstance(JobResponseDto, mappedData, {
			excludeExtraneousValues: true,
			groups: userPermissions,
		}) as unknown as Job[]

		return {
			data: result,
			paginate: {
				limit: Number(limit),
				page: Number(page),
				total,
				totalPages: Math.ceil(total / Number(limit)),
			},
		}
	}
}
