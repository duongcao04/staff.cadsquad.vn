import { Controller, Get } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
// Giả sử bạn có guard và decorator bảo vệ route
// import { JwtAuthGuard } from '../../auth/jwt.guard';
// import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('admin/dashboard')
// @UseGuards(JwtAuthGuard)
// @RequirePermissions('SYSTEM', 'READ') // Yêu cầu quyền truy cập cấp cao
export class AdminDashboardController {
	constructor(private readonly dashboardService: AdminDashboardService) { }

	@Get('kpis')
	async getKpis() {
		return this.dashboardService.getOverviewKpis();
	}

	@Get('db-stats')
	async getDbStats() {
		return this.dashboardService.getDatabaseStats();
	}
}