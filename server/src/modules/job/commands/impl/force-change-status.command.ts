import { ChangeStatusDto } from '../../dto/change-status.dto';

export class ForceChangeStatusCommand {
	constructor(
		public readonly jobId: string,
		public readonly modifierId: string,
		public readonly dto: ChangeStatusDto,
	) { }
}