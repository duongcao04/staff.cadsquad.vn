import { PrismaService } from '@/providers/prisma/prisma.service';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';
import { JobResponseDto } from '../../dto/job-response.dto';
import { JobHelpersService } from '../../job-helpers.service';

export class GetMonthlyDeadlinesQuery {
	constructor(
		public readonly month: number,
		public readonly year: number,
		public readonly userId: string,
		public readonly userPermissions: string[]
	) { }
}

@QueryHandler(GetMonthlyDeadlinesQuery)
export class GetMonthlyDeadlinesHandler implements IQueryHandler<GetMonthlyDeadlinesQuery> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jobHelper: JobHelpersService,
	) { }

	async execute(query: GetMonthlyDeadlinesQuery) {
		const { month, year, userId, userPermissions } = query;

		// 1. Tính toán khoảng thời gian đầu và cuối tháng
		const startOfMonth = dayjs()
			.year(year)
			.month(month - 1)
			.startOf('month')
			.toDate();

		const endOfMonth = dayjs()
			.year(year)
			.month(month - 1)
			.endOf('month')
			.toDate();

		// 2. Lấy điều kiện phân quyền (Chỉ xem job mình được gán hoặc xem tất cả nếu là Admin)
		const userPermissionQuery = await this.jobHelper.buildPermission(userId);

		// 3. Truy vấn Database
		const rawData = await this.prisma.job.findMany({
			where: {
				AND: [
					{ dueAt: { gte: startOfMonth, lte: endOfMonth } },
					{ deletedAt: null },
					userPermissionQuery,
				],
			},
			include: {
				status: true,
				type: true,
				assignments: { include: { user: true } },
			},
			orderBy: { dueAt: 'asc' },
		});

		// 4. Map dữ liệu dựa trên Role (Ẩn staff cost nếu không có quyền)
		const mappedData = await this.jobHelper.mapRoleBasedData(rawData, userId);

		return plainToInstance(JobResponseDto, mappedData, {
			excludeExtraneousValues: true,
			groups: userPermissions,
		});
	}
}