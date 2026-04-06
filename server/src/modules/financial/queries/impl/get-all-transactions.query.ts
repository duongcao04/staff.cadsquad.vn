import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PrismaService } from '../../../../providers/prisma/prisma.service'
import { Prisma, TransactionType } from '../../../../generated/prisma'

export class GetAllTransactionsQuery {
	constructor(
		public readonly page: number,
		public readonly limit: number,
		public readonly search: string,
		public readonly type: string
	) {}
}

@QueryHandler(GetAllTransactionsQuery)
export class GetAllTransactionsHandler implements IQueryHandler<GetAllTransactionsQuery> {
	constructor(private readonly prisma: PrismaService) {}

	async execute(query: GetAllTransactionsQuery) {
		const { page = 1, limit = 20, search, type } = query

		const where: Prisma.TransactionWhereInput = {
			status: 'COMPLETED',
			type: (type as TransactionType) || undefined,
			OR: search
				? [
						{
							referenceNo: {
								contains: search,
								mode: 'insensitive',
							},
						},
						{
							job: {
								no: { contains: search, mode: 'insensitive' },
							},
						},
						{
							client: {
								name: { contains: search, mode: 'insensitive' },
							},
						},
					]
				: undefined,
		}

		const [data, total] = await Promise.all([
			this.prisma.transaction.findMany({
				where,
				skip: (page - 1) * limit,
				take: Number(limit),
				include: {
					job: true,
					client: true,
					assignment: { include: { user: true } },
					paymentChannel: true,
				},
				orderBy: { createdAt: 'desc' },
			}),
			this.prisma.transaction.count({ where }),
		])

		return {
			data,
			paginate: { total, page, limit },
		}
	}
}

