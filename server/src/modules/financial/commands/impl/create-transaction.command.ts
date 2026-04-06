import { CreateTransactionDto } from "../../dtos/create-transaction.dto";

export class CreateTransactionCommand {
	constructor(
		public readonly userId: string, // Actor thực hiện
		public readonly data: CreateTransactionDto
	) { }
}