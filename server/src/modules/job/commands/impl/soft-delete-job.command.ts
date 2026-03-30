export class SoftDeleteJobCommand {
	constructor(
		public readonly jobId: string,
		public readonly modifierId: string,
	) { }
}