import { NotFoundException } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Job } from 'bullmq'
import { plainToInstance } from 'class-transformer'
import { PrismaService } from '../../../../providers/prisma/prisma.service'
import { JobResponseDto } from '../../dto/job-response.dto'
import { JobHelpersService } from '../../job-helpers.service'

export class FindJobByNoQuery {
	constructor(
		public readonly userId: string,
		public readonly userPermissions: string[],
		public readonly jobNo: string
	) { }
}

@QueryHandler(FindJobByNoQuery)
export class FindJobByNoHandler implements IQueryHandler<FindJobByNoQuery> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jobHelper: JobHelpersService
	) { }

	async execute(query: FindJobByNoQuery) {
		const { jobNo, userId, userPermissions } = query
		const userPermission = await this.jobHelper.buildPermission(userId)
		const job = await this.prisma.job.findFirst({
			where: { AND: [userPermission, { no: jobNo }] },
			include: {
				type: true,
				createdBy: true,
				paymentChannel: true,
				status: true,
				client: { select: { id: true, name: true } },
				assignments: {
					include: { user: { include: { department: true } } },
				},
				comments: {
					include: { user: true },
					orderBy: { createdAt: 'desc' },
				},
				activityLog: {
					include: { modifiedBy: true },
					orderBy: { modifiedAt: 'desc' },
				},
				sharepointFolder: true,
				folderTemplate: true
			},
		})
		if (!job) throw new NotFoundException('Job not found')
		const mappedData = (await this.jobHelper.mapRoleBasedData([job], userId))[0]

		return plainToInstance(JobResponseDto, mappedData, {
			excludeExtraneousValues: true,
			groups: userPermissions,
		}) as unknown as Job
	}
}
