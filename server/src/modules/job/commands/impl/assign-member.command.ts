import { AssignMemberDto } from '../../dto/assign-member.dto';

export class AssignMemberCommand {
	constructor(
		public readonly modifierId: string,
		public readonly jobId: string,
		public readonly dto: AssignMemberDto,
	) { }
}