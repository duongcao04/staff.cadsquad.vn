import { PrismaService } from "@/providers/prisma/prisma.service";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { JobHelpersService } from "@/modules/job/job-helpers.service";
import dayjs from "dayjs";

export class GetScheduleQuery {
	constructor(
		public readonly userId: string,
		public readonly month: number,
		public readonly year: number,
		public readonly day?: number
	) { }
}

@QueryHandler(GetScheduleQuery)
export class GetScheduleHandler implements IQueryHandler<GetScheduleQuery> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jobHelpers: JobHelpersService,
	) { }

	async execute(query: GetScheduleQuery) {
		const { userId, month, year, day } = query;

		const baseDate = dayjs().year(year).month(month - 1);

		let start: Date;
		let end: Date;

		if (day) {
			// Kiểm tra nếu day không hợp lệ cho tháng đó (VD: 31/02)
			const daysInMonth = baseDate.daysInMonth();
			const targetDay = day > daysInMonth ? daysInMonth : day;

			const dateObj = baseDate.date(targetDay);
			start = dateObj.startOf('day').toDate();
			end = dateObj.endOf('day').toDate();
		} else {
			start = baseDate.startOf('month').toDate();
			end = baseDate.endOf('month').toDate();
		}

		// 2. Dùng buildPermission() để áp dụng scope-aware filter
		const buildPermission = await this.jobHelpers.buildPermission(userId);

		// 3. Query DB
		const jobsSchedule = await this.prisma.job.findMany({
			where: {
				AND: [
					buildPermission,
					{
						dueAt: {
							gte: start,
							lte: end,
						},
					},
					{
						status: {
							systemType: { notIn: ['TERMINATED', 'COMPLETED'] },
						},
					},
					{
						deletedAt: null,
					},
				],
			},
			include: {
				status: {
					select: {
						displayName: true,
						hexColor: true,
						code: true,
						thumbnailUrl: true,
					},
				},
				type: true,
			},
			orderBy: {
				dueAt: 'asc',
			},
		});

		return {
			jobsSchedule,
			meta: {
				start,
				end,
				type: day ? 'day' : 'month',
				total: jobsSchedule.length,
			},
		};
	}
}