import { PartialType } from '@nestjs/swagger';
import { CreateJobFolderTemplateDto } from './create-job-folder-template.dto';

export class UpdateJobFolderTemplateDto extends PartialType(CreateJobFolderTemplateDto) { }