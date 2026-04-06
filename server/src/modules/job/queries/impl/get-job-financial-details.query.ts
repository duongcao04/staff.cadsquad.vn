import { NotFoundException } from '@nestjs/common'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { PrismaService } from '../../../../providers/prisma/prisma.service'

export class GetJobFinancialDetailsQuery {
	constructor(public readonly jobId: string) {}
}

@QueryHandler(GetJobFinancialDetailsQuery)
export class GetJobFinancialDetailsHandler implements IQueryHandler<GetJobFinancialDetailsQuery> {
	constructor(private readonly prisma: PrismaService) {}

	async execute(query: GetJobFinancialDetailsQuery) {
		const { jobId } = query

		// 1. Lấy dữ liệu Job cùng các quan hệ liên quan
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				client: { select: { name: true } },
				assignments: {
					include: {
						user: {
							select: {
								id: true,
								displayName: true,
								avatar: true,
							},
						},
						// Lấy các giao dịch PAYOUT cho từng staff
						transactions: {
							where: { type: 'PAYOUT', status: 'COMPLETED' },
						},
					},
				},
				// Lấy các giao dịch INCOME từ khách hàng cho Job này
				transactions: {
					where: { type: 'INCOME', status: 'COMPLETED' },
				},
			},
		})

		if (!job) throw new NotFoundException('Job not found')

		// 2. Tính toán phía Client (Thu nhập)
		const totalCollected = job.transactions.reduce(
			(sum, t) => sum + t.amount,
			0
		)
		const remainingReceivable = job.incomeCost - totalCollected

		// 3. Tính toán phía Staff (Chi phí)
		let totalStaffCostQuota = 0 // Tổng định mức phải trả (staffCost trong assignment)
		let totalStaffPaid = 0 // Tổng thực tế đã trả (từ transaction)

		const staffBreakdown = job.assignments.map((asm) => {
			const paid = asm.transactions.reduce((sum, t) => sum + t.amount, 0)
			const debt = asm.staffCost - paid

			totalStaffCostQuota += asm.staffCost
			totalStaffPaid += paid

			return {
				assignmentId: asm.id,
				userId: asm.user.id,
				displayName: asm.user.displayName,
				avatar: asm.user.avatar,
				quota: asm.staffCost,
				paid: paid,
				remainingDebt: debt,
				isFullyPaid: debt <= 0,
			}
		})

		// 4. Tính toán lợi nhuận (Profit)
		// Lợi nhuận tiềm năng = Ngân sách - Tổng định mức nhân sự
		const potentialProfit = job.incomeCost - totalStaffCostQuota

		// Lợi nhuận thực tế hiện tại = Tiền đã thu - Tiền đã chi
		const actualCashProfit = totalCollected - totalStaffPaid

		return {
			jobId: job.id,
			jobNo: job.no,
			incomeCost: job.incomeCost,
			summary: {
				totalCollected,
				remainingReceivable,
				isClientFullyPaid: remainingReceivable <= 0,
				totalStaffCostQuota,
				totalStaffPaid,
				staffDebt: totalStaffCostQuota - totalStaffPaid,
				potentialProfit,
				actualCashProfit,
				marginPercent:
					job.incomeCost > 0
						? Math.round((potentialProfit / job.incomeCost) * 100)
						: 0,
			},
			staffBreakdown,
		}
	}
}
