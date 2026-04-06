import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PrismaService } from '../../../../providers/prisma/prisma.service'
import { CreateTransactionCommand } from '../impl/create-transaction.command'
import { JOB_PAYMENT_STATUS } from '../../../../generated/prisma'
import { NotFoundException } from '@nestjs/common'

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
	constructor(private readonly prisma: PrismaService) {}

	async execute(command: CreateTransactionCommand) {
		const { userId, data } = command

		return await this.prisma.$transaction(async (tx) => {
			// 1. Tạo bản ghi giao dịch (INCOME hoặc PAYOUT)
			const transaction = await tx.transaction.create({
				data: {
					...data,
					createdById: userId,
					status: 'COMPLETED',
				},
				include: { job: true },
			})

			// 2. Logic cập nhật Payment Status cho Staff (nếu là loại PAYOUT)
			if (data.type === 'PAYOUT' && data.jobId) {
				// Lấy tổng định mức staffCost mà Job này cần trả
				const job = await tx.job.findUnique({
					where: { id: data.jobId },
					select: { totalStaffCost: true },
				})

				// Tính tổng các giao dịch PAYOUT đã COMPLETED của Job này
				const aggregate = await tx.transaction.aggregate({
					where: {
						jobId: data.jobId,
						type: 'PAYOUT',
						status: 'COMPLETED',
					},
					_sum: { amount: true },
				})

				const totalPaidToStaff = aggregate._sum.amount || 0

				// Xác định trạng thái thanh toán mới
				let newPayoutStatus: JOB_PAYMENT_STATUS = 'UNPAID'

				if (!job) {
					throw new NotFoundException('Job not found')
				}

				if (
					totalPaidToStaff >= job.totalStaffCost &&
					job.totalStaffCost > 0
				) {
					newPayoutStatus = 'PAID' // Đã thanh toán đủ cho toàn bộ team
				} else if (totalPaidToStaff > 0) {
					newPayoutStatus = 'PENDING' // Đang thanh toán dở dang
				}

				// Tìm status hệ thống TERMINATED (đã đóng hồ sơ)
				const finishStatus = await tx.jobStatus.findFirst({
					where: { systemType: 'TERMINATED' },
				})
				// Cập nhật trạng thái vào bảng Job
				await tx.job.update({
					where: { id: data.jobId },
					data: {
						paymentStatus: newPayoutStatus,
						status: { connect: { id: finishStatus?.id } },
						finishedAt: new Date(),
						// Nếu đã trả xong hoàn toàn, cập nhật ngày hoàn tất payout
						payoutDate:
							newPayoutStatus === 'PAID' ? new Date() : null,
					},
				})
			}

			// 3. Tự động ghi log tài chính vào AuditLog
			await tx.systemAuditLog.create({
				data: {
					actorId: userId,
					module: 'FINANCIAL',
					action:
						data.type === 'INCOME'
							? 'CLIENT_PAYMENT'
							: 'STAFF_PAYOUT',
					targetId: transaction.id,
					targetDisplay: `${transaction.job.no}: ${data.amount.toLocaleString()} VND`,
					newValues: transaction as any,
				},
			})

			return transaction
		})
	}
}
