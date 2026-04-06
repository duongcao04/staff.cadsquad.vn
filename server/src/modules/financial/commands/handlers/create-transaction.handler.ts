import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "../../../../providers/prisma/prisma.service";
import { CreateTransactionCommand } from "../impl/create-transaction.command";

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
	constructor(private readonly prisma: PrismaService) { }

	async execute(command: CreateTransactionCommand) {
		const { userId, data } = command;

		return await this.prisma.$transaction(async (tx) => {
			// 1. Tạo bản ghi giao dịch
			const transaction = await tx.transaction.create({
				data: {
					...data,
					createdById: userId,
					status: 'COMPLETED',
				},
				include: { job: true }
			});

			// 2. Tự động ghi log tài chính vào AuditLog
			await tx.systemAuditLog.create({
				data: {
					actorId: userId,
					module: 'FINANCIAL',
					action: data.type === 'INCOME' ? 'CLIENT_PAYMENT' : 'STAFF_PAYOUT',
					targetId: transaction.id,
					targetDisplay: `${transaction.job.no}: ${data.amount.toLocaleString()} VND`,
					newValues: transaction as any,
				}
			});

			return transaction;
		});
	}
}