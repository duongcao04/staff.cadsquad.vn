import { UpdateRevenueDto } from '../../dto/update-revenue.dto';

export class UpdateFinancialDetailsCommand {
	constructor(
		public readonly modifierId: string,
		public readonly jobId: string,
		public readonly dto: UpdateRevenueDto,
	) { }
}