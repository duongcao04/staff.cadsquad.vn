import { UpdateAttachmentsDto } from "../../dto/update-attachments.dto";
import { UpdateGeneralJobDto } from "../../dto/update-general.dto";

export class UpdateJobCommand {
	constructor(
		public readonly modifierId: string,
		public readonly jobId: string,
		public readonly dto: UpdateGeneralJobDto & { attachments?: UpdateAttachmentsDto }
	) { }
}