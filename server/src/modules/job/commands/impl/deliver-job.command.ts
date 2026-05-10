import { DeliverJobDto } from '../../dto/deliver-job.dto'

export class DeliverJobCommand {
	constructor(
		public readonly userId: string,
		public readonly jobId: string,
		public readonly dto: DeliverJobDto
	) {}
}
