export class ConfirmPaymentCommand {
	constructor(
		public readonly jobId: string,
		public readonly modifierId: string,
	) { }
}