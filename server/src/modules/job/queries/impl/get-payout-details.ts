import { PrismaService } from '@/providers/prisma/prisma.service';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';
import { JobResponseDto } from '../../dto/job-response.dto';
import { JobHelpersService } from '../../job-helpers.service';
import { NotFoundException } from '@nestjs/common';

export class GetPayoutDetailsQuery {
	constructor(
		public readonly userId: string,
		public readonly userPermissions: string[],
		public readonly jobNo: string
	) { }
}

@QueryHandler(GetPayoutDetailsQuery)
export class GetPayoutDetailsHandler implements IQueryHandler<GetPayoutDetailsQuery> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jobHelper: JobHelpersService,
	) { }

	async execute(query: GetPayoutDetailsQuery) {
		const { userId, userPermissions, jobNo } = query;

		const userPermission = await this.jobHelper.buildPermission(userId)
		const rawData = await this.prisma.job.findFirst({
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
		if (!rawData) throw new NotFoundException('Job not found')
		const mappedData = (await this.jobHelper.mapRoleBasedData([rawData], userId))[0]

		return plainToInstance(JobResponseDto, mappedData, {
			excludeExtraneousValues: true,
			groups: userPermissions,
		});
	}
}