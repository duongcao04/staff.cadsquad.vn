export class RestoreJobCommand {
	constructor(
		public readonly jobId: string,
		public readonly modifierId: string,
	) { }
}