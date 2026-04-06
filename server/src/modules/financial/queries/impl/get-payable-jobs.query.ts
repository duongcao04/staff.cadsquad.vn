import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PrismaService } from '../../../../providers/prisma/prisma.service'

export class GetPayableJobsQuery {
	constructor(public readonly userId: string) {}
}

@QueryHandler(GetPayableJobsQuery)
export class GetPayableJobsHandler implements IQueryHandler<GetPayableJobsQuery> {
	constructor(private readonly prisma: PrismaService) {}

	async execute(query: GetPayableJobsQuery) {
		// 1. Lấy Job kèm theo quan hệ cần thiết
		const jobs = await this.prisma.job.findMany({
			where: {
				deletedAt: null,
				assignments: {
					some: { staffCost: { gt: 0 } },
				},
				status: {
					systemType: 'COMPLETED',
				},
			},
			include: {
				client: { select: { name: true } },
				status: true,
				type: true,
				assignments: {
					where: { staffCost: { gt: 0 } }, // Chỉ lấy assignment có phí để tối ưu loop
					include: {
						user: { select: { displayName: true, avatar: true } },
						transactions: {
							where: {
								type: 'PAYOUT',
								status: 'COMPLETED',
							},
							select: { amount: true }, // Chỉ lấy amount để nhẹ memory
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		// 2. Map và tính toán
		const payableJobs = jobs.map((job) => {
			let totalJobStaffCost = 0
			let totalJobPaid = 0

			const staffDetails = job.assignments.map((asm) => {
				// Sử dụng reduce an toàn
				const paid = asm.transactions.reduce(
					(sum, t) => sum + t.amount,
					0
				)
				// Fix lỗi làm tròn số thực bằng cách dùng Math.max hoặc toFixed nếu cần
				const debt = Math.max(0, asm.staffCost - paid)

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

			const totalJobDebt = Math.max(0, totalJobStaffCost - totalJobPaid)

			return {
				id: job.id,
				jobNo: job.no,
				displayName: job.displayName,
				clientName: job.client?.name,
				status: job.status,
				type: job.type,
				financial: {
					totalStaffCost: totalJobStaffCost,
					totalPaid: totalJobPaid,
					totalDebt: totalJobDebt,
				},
				// Chỉ lấy những staff thực sự còn nợ tiền
				pendingStaff: staffDetails.filter((s) => s.debtAmount > 0),
			}
		})

		// 3. Trả về Job còn nợ, đồng thời lọc bỏ các Job mà định mức trả lương bằng 0 (nếu có)
		return payableJobs.filter((j) => j.financial.totalDebt > 0)
	}
}
