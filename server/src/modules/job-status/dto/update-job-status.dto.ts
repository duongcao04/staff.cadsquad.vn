import { PartialType } from '@nestjs/swagger';
import { CreateJobStatusDto } from './create-job-status.dto';

export class UpdateJobStatusDto extends PartialType(CreateJobStatusDto) {}
