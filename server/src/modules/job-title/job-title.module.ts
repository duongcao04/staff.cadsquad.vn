import { Module } from '@nestjs/common';
import { JobTitleService } from './job-title.service';
import { JobTitleController } from './job-title.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [JobTitleController],
  providers: [JobTitleService],
  exports: [JobTitleService],
})
export class JobTitleModule { }
