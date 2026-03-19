import { Module } from '@nestjs/common';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { AdminJobsModule } from './admin-jobs/admin-jobs.module';

@Module({
	imports: [
		AdminDashboardModule,
		AdminUsersModule,
		AdminJobsModule,
	],
})
export class AdministratorModule { }