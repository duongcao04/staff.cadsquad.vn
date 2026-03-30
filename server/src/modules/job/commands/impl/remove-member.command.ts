export class RemoveMemberCommand {
	constructor(
		public readonly modifierId: string,
		public readonly jobId: string,
		public readonly userId: string,
	) { }
}