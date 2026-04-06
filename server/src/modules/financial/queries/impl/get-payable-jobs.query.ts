import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PrismaService } from '../../../../providers/prisma/prisma.service'

export class GetPayableJobsQuery {
	constructor(public readonly userId: string) {}
}

@QueryHandler(GetPayableJobsQuery)
export class GetPayableJobsHandler implements IQueryHandler<GetPayableJobsQuery> {
	constructor(private readonly prisma: PrismaService) {}

	async execute(query: GetPayableJobsQuery) {
		// 1. Lấy Job làm gốc, kèm theo các Assignments và Transactions loại PAYOUT
		const jobs = await this.prisma.job.findMany({
			where: {
				deletedAt: null,
				assignments: {
					some: { staffCost: { gt: 0 } }, // Chỉ lấy Job có phát sinh chi phí nhân sự
				},
			},
			include: {
				client: { select: { name: true } },
				status: true,
				type: true,
				assignments: {
					include: {
						user: { select: { displayName: true, avatar: true } },
						// Lấy các giao dịch chi trả cho chính assignment này
						transactions: {
							where: {
								type: 'PAYOUT',
								status: 'COMPLETED',
							},
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		// 2. Map dữ liệu để tính toán công nợ theo Job
		const payableJobs = jobs.map((job) => {
			let totalJobStaffCost = 0
			let totalJobPaid = 0

			// Tính toán chi tiết cho từng người trong Job
			const staffDetails = job.assignments.map((asm) => {
				const paid = asm.transactions.reduce(
					(sum, t) => sum + t.amount,
					0
				)
				const debt = asm.staffCost - paid

				totalJobStaffCost += asm.staffCost
				totalJobPaid += paid

				return {
					assignmentId: asm.id,
					staffName: asm.user.displayName,
					avatar: asm.user.avatar,
					staffCost: asm.staffCost,
					paidAmount: paid,
					debtAmount: debt,
					isFullyPaid: debt <= 0,
				}
			})

			const totalJobDebt = totalJobStaffCost - totalJobPaid

			return {
				id: job.id,
				jobNo: job.no,
				displayName: job.displayName,
				clientName: job.client?.name,
				status: job.status,
				type: job.type,
				// Tổng hợp tài chính của Job
				financial: {
					totalStaffCost: totalJobStaffCost,
					totalPaid: totalJobPaid,
					totalDebt: totalJobDebt,
				},
				// Danh sách chi tiết các staff chưa được trả đủ (tùy chọn hiển thị)
				pendingStaff: staffDetails.filter((s) => s.debtAmount > 0),
			}
		})

		// 3. Chỉ trả về những Job nào thực sự còn nợ tiền Staff
		return payableJobs.filter((j) => j.financial.totalDebt > 0)
	}
}
