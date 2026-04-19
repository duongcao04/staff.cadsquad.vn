export class JobSyncSharepointCommand {
	constructor(
		public readonly jobId: string,
		public readonly modifierId: string
	) {}
}
