import { Module } from '@nestjs/common';
import { JobStatusService } from './job-status.service';
import { JobStatusController } from './job-status.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [JobStatusController],
  providers: [JobStatusService],
  exports: [JobStatusService]
})
export class JobStatusModule { }
