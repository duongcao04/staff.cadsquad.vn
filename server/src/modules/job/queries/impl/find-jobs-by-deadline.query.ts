import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Job } from 'bullmq'
import { plainToInstance } from 'class-transformer'
import dayjs from 'dayjs'
import { PrismaService } from '../../../../providers/prisma/prisma.service'
import { JobResponseDto } from '../../dto/job-response.dto'
import { JobHelpersService } from '../../job-helpers.service'

export class FindJobsByDeadlineQuery {
	constructor(
		public readonly userId: string,
		public readonly userPermissions: string[],
		public readonly isoDate: string
	) { }
}

@QueryHandler(FindJobsByDeadlineQuery)
export class FindJobsByDeadlineHandler implements IQueryHandler<FindJobsByDeadlineQuery> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jobHelper: JobHelpersService
	) { }

	async execute(query: FindJobsByDeadlineQuery) {
		const { isoDate, userId, userPermissions } = query

		const startOfDay = dayjs(isoDate).startOf('day').toDate()
		const endOfDay = dayjs(isoDate).endOf('day').toDate()
		const userPermission = await this.jobHelper.buildPermission(userId)

		const rawData = await this.prisma.job.findMany({
			where: {
				AND: [
					{ dueAt: { gte: startOfDay, lte: endOfDay } },
					{ deletedAt: null },
					userPermission,
				],
			},
			include: {
				status: true,
				type: true,
				assignments: { include: { user: true } },
			},
		})
		const mappedData = await this.jobHelper.mapRoleBasedData(rawData, userId)
		return plainToInstance(JobResponseDto, mappedData, {
			excludeExtraneousValues: true,
			groups: userPermissions,
		}) as unknown as Job[]
	}
}
