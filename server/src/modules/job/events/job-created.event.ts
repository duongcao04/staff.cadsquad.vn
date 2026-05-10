export class JobCreatedEvent {
	constructor(
		public readonly data: {
			typeId: string
			sharepointTemplateId?: string
			useExistingSharepointFolder?: string
			sharepointFolderId?: string
			no: string
			displayName: string
			clientName: string
		}
	) {}
}
