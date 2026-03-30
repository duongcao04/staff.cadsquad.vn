import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Job } from "bullmq";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "../../../../providers/prisma/prisma.service";
import { JobResponseDto } from "../../dto/job-response.dto";
import { JobHelpersService } from "../../job-helpers.service";

export class FindJobsToDeliverQuery {
	constructor(
		public readonly userId: string,
		public readonly userPermissions: string[]
	) { }
}

@QueryHandler(FindJobsToDeliverQuery)
export class FindJobsToDeliverHandler implements IQueryHandler<FindJobsToDeliverQuery> {
	constructor(private readonly helper: JobHelpersService, private readonly prisma: PrismaService) { }

	async execute(query: FindJobsToDeliverQuery) {
		const { userId, userPermissions } = query;
		const userPermission = await this.helper.buildPermission(userId)
		const rawData = await this.prisma.job.findMany({
			where: {
				AND: [
					userPermission,
					{ status: { code: { in: ['in-progress', 'revision'] } } },
					{ deletedAt: null },
				],
			},
			orderBy: { dueAt: 'asc' },
			include: {
				status: true,
				type: true,
				assignments: { include: { user: true } },
			},
		})
		const mappedData = await this.helper.mapRoleBasedData(rawData, userId)
		return plainToInstance(JobResponseDto, mappedData, {
			excludeExtraneousValues: true,
			groups: userPermissions,
		}) as unknown as Job[]
	}
}