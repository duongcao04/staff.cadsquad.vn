import { Module } from '@nestjs/common';
import { JobFolderTemplateService } from './job-folder-template.service';
import { JobFolderTemplateController } from './job-folder-template.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [JobFolderTemplateController],
  providers: [JobFolderTemplateService],
  exports: [JobFolderTemplateService],
})
export class JobFolderTemplateModule { }