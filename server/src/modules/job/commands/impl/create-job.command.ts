import { CreateJobDto } from '../../dto/create-job.dto';

export class CreateJobCommand {
	constructor(
		public readonly creatorId: string,
		public readonly dto: CreateJobDto,
	) { }
}