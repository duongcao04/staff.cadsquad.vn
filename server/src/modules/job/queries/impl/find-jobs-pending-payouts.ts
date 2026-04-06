import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "../../../../providers/prisma/prisma.service";
import { JobHelpersService } from "../../job-helpers.service";

export class FindJobsPendingPayoutsQuery {
	constructor(
	) { }
}


@QueryHandler(FindJobsPendingPayoutsQuery)
export class FindJobsPendingPayoutsHandler implements IQueryHandler<FindJobsPendingPayoutsQuery> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly helper: JobHelpersService,
	) { }

	async execute(query: FindJobsPendingPayoutsQuery) {
		const result = await this.prisma.job.findMany({
			where: {
				status: { systemType: 'COMPLETED' },
				paymentStatus: 'PENDING',
				deletedAt: null,
			},
			include: {
				status: true,
				type: true,
				paymentChannel: true,
				assignments: { include: { user: true } },
			},
			orderBy: { completedAt: 'asc' },
		});

		return result.map((it) => ({
			...it,
			totalStaffCost: it.totalStaffCost,
		}));
	}
}