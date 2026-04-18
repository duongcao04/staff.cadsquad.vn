import { CreateJobDto } from '../dto/create-job.dto'

export class JobCreatedEvent {
	constructor(
		public readonly data: {
			typeId: string
			sharepointTemplateId?: string
			useExistingSharepointFolder?: string
			no: string
			displayName: string
			clientName: string
		}
	) {}
}
