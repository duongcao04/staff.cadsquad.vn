import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PrismaService } from '../../../../providers/prisma/prisma.service'
import { BulkPayoutCommand } from '../impl/bulk-payout.command'
import { Transaction } from '../../../../generated/prisma'

@CommandHandler(BulkPayoutCommand)
export class BulkPayoutHandler implements ICommandHandler<BulkPayoutCommand> {
	constructor(private readonly prisma: PrismaService) {}

	async execute(command: BulkPayoutCommand) {
		const { userId, jobIds, paymentChannelId } = command

		return await this.prisma.$transaction(async (tx) => {
			const results: Transaction[] = []

			for (const jobId of jobIds) {
				// 1. Lấy các assignment chưa trả đủ tiền của Job này
				const assignments = await tx.jobAssignment.findMany({
					where: { jobId, staffCost: { gt: 0 } },
					include: {
						transactions: {
							where: { type: 'PAYOUT', status: 'COMPLETED' },
						},
						job: { select: { no: true } },
					},
				})

				for (const asm of assignments) {
					const paidAmount = asm.transactions.reduce(
						(sum, t) => sum + t.amount,
						0
					)
					const debtAmount = asm.staffCost - paidAmount

					if (debtAmount > 0) {
						// 2. Tạo giao dịch PAYOUT cho số tiền còn nợ
						const transaction = await tx.transaction.create({
							data: {
								amount: debtAmount,
								type: 'PAYOUT',
								status: 'COMPLETED',
								jobId: jobId,
								assignmentId: asm.id,
								paymentChannelId: paymentChannelId,
								createdById: userId,
								note: `Bulk payout for Job #${asm.job.no}`,
							},
						})

						// 3. Ghi log hệ thống
						await tx.systemAuditLog.create({
							data: {
								actorId: userId,
								module: 'FINANCIAL',
								action: 'BULK_PAYOUT_ASSIGNMENT',
								targetId: transaction.id,
								targetDisplay: `Paid ${debtAmount.toLocaleString()} VND to Assignment ${asm.id}`,
							},
						})

						results.push(transaction)
					}
				}
			}
			return { processedCount: results.length }
		})
	}
}
