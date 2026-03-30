import { UpdateAssignmentDto } from '../../dto/assign-member.dto';

export class UpdateAssignmentCostCommand {
	constructor(
		public readonly modifierId: string,
		public readonly jobId: string,
		public readonly memberId: string,
		public readonly dto: UpdateAssignmentDto,
	) { }
}