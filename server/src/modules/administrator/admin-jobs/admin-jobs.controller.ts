import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AdminJobsService } from './admin-jobs.service';

@Controller('admin/jobs')
export class AdminJobsController {
	constructor(private readonly adminJobsService: AdminJobsService) { }

	@Get("stats")
	@ApiOperation({ summary: 'Get stats of jobs' })
	async getStats(@Query("from") from: string, @Query("to") to: string) {
		return this.adminJobsService.getStatsData({ from, to })
	}

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