import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PrismaService } from '../../../../providers/prisma/prisma.service'
import { NotFoundException } from '@nestjs/common'

export class GetJobPayoutDetailQuery {
	constructor(public readonly jobNo: string) {}
}

@QueryHandler(GetJobPayoutDetailQuery)
export class GetJobPayoutDetailHandler implements IQueryHandler<GetJobPayoutDetailQuery> {
	constructor(private readonly prisma: PrismaService) {}

	async execute(query: GetJobPayoutDetailQuery) {
		const { jobNo } = query

		const job = await this.prisma.job.findUnique({
			where: { no: jobNo },
			include: {
				client: { select: { name: true } },
				paymentChannel: true,
				assignments: {
					include: {
						user: {
							select: {
								id: true,
								displayName: true,
								avatar: true,
								jobTitle: { select: { displayName: true } },
							},
						},
						// Lấy các giao dịch PAYOUT liên quan đến assignment này
						transactions: {
							where: { type: 'PAYOUT', status: 'COMPLETED' },
							select: { amount: true },
						},
					},
				},
			},
		})

		if (!job) throw new NotFoundException(`Job #${jobNo} not found`)

		// Map lại danh sách assignments để tính toán trạng thái thanh toán từng người
		const processedAssignments = job.assignments.map((asm) => {
			const totalPaid = asm.transactions.reduce(
				(sum, t) => sum + t.amount,
				0
			)
			const remainingDebt = Math.max(0, asm.staffCost - totalPaid)

			return {
				id: asm.id,
				staffCost: asm.staffCost,
				totalPaid,
				remainingDebt,
				isFullyPaid: remainingDebt <= 0,
				user: asm.user,
			}
		})

		return {
			id: job.id,
			no: job.no,
			displayName: job.displayName,
			incomeCost: job.incomeCost,
			client: job.client,
			paymentChannel: job.paymentChannel,
			paymentStatus: job.paymentStatus, // Trạng thái tổng quát của Job
			assignments: processedAssignments,
			// Filter nhanh cho Frontend nếu cần: danh sách những người chưa được trả đủ
			pendingAssignments: processedAssignments.filter(
				(a) => !a.isFullyPaid
			),
		}
	}
}
