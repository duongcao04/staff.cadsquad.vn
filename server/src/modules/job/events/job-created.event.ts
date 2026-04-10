export class JobCreatedEvent {
	constructor(
		public readonly jobNo: string,
		public readonly clientName: string,
		public readonly displayName: string,
		public readonly typeId: number,
		public readonly sharepointTemplateId?: string
	) {}
}
