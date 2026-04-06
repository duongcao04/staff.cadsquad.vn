import { NotFoundException } from '@nestjs/common'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { PrismaService } from '../../../../providers/prisma/prisma.service'

export class GetTransactionDetailQuery {
	constructor(public readonly id: string) {}
}

@QueryHandler(GetTransactionDetailQuery)
export class GetTransactionDetailHandler implements IQueryHandler<GetTransactionDetailQuery> {
	constructor(private readonly prisma: PrismaService) {}

	async execute(query: GetTransactionDetailQuery) {
		const transaction = await this.prisma.transaction.findUnique({
			where: { id: query.id },
			include: {
				job: {
					select: { id: true, no: true, displayName: true },
				},
				client: {
					select: { id: true, name: true, email: true },
				},
				assignment: {
					include: {
						user: { select: { displayName: true, avatar: true } },
					},
				},
				paymentChannel: true,
				createdBy: {
					select: { displayName: true, avatar: true },
				},
			},
		})

		if (!transaction) {
			throw new NotFoundException(
				`Transaction with ID ${query.id} not found`
			)
		}

		return transaction
	}
}
