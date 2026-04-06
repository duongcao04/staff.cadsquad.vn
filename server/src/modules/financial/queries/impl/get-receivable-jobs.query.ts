
import { PrismaService } from '@/providers/prisma/prisma.service';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { JobResponseDto } from '../../../job/dto/job-response.dto';

export class GetReceivableJobsQuery {
	constructor(
		public readonly userId: string,
		public readonly userPermissions: string[]
	) { }
}

@QueryHandler(GetReceivableJobsQuery)
export class GetReceivableJobsHandler implements IQueryHandler<GetReceivableJobsQuery> {
	constructor(
		private readonly prisma: PrismaService,
	) { }

	async execute(query: GetReceivableJobsQuery): Promise<any> {
		// 1. Lấy tất cả các Jobs kèm theo giao dịch INCOME của chúng
		const jobs = await this.prisma.job.findMany({
			where: {
				deletedAt: null,
			},
			include: {
				client: true,
				type: true,
				status: true,
				transactions: {
					where: {
						type: 'INCOME',
						status: 'COMPLETED'
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
		

		// 2. Lọc thủ công những Job chưa thu đủ tiền
		const receivableJobs = jobs.map(job => {
			const totalPaid = job.transactions.reduce((sum, t) => sum + t.amount, 0);
			const remainingAmount = job.incomeCost - totalPaid;

			return {
				...job,
				totalPaid,
				remainingAmount
			};
		}).filter(job => job.remainingAmount > 0);

		// 3. Transform sang DTO
		return receivableJobs.map(item => ({
			...plainToInstance(JobResponseDto, item, { excludeExtraneousValues: true }),
			financial: {
				totalPaid: item.totalPaid,
				remainingAmount: item.remainingAmount,
				isPartiallyPaid: item.totalPaid > 0
			}
		}));
	}
}