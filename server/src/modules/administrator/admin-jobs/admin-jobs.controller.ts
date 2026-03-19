import { Body, Controller, Post } from '@nestjs/common';
import { AdminJobsService } from './admin-jobs.service';

@Controller('admin/jobs')
export class AdminJobsController {
	constructor(private readonly adminJobsService: AdminJobsService) { }

	@Post('bulk-status')
	async bulkStatusUpdate(
		@Body('jobIds') jobIds: string[],
		@Body('statusId') statusId: string
	) {
		return this.adminJobsService.bulkUpdateStatus(jobIds, statusId);
	}

	@Post('bulk-delete')
	async bulkDelete(@Body('jobIds') jobIds: string[]) {
		return this.adminJobsService.bulkDeleteJobs(jobIds);
	}
}