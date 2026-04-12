import { CreateJobDto } from '../dto/create-job.dto'

export class JobCreatedEvent {
	constructor(
		public readonly data: CreateJobDto & {
			destinationFolderCreationId: string
		}
	) {}
}
