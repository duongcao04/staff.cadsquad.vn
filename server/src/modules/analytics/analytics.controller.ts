import {
	Controller,
	Get,
	Query,
	Param,
	UseGuards,
	ParseIntPipe,
	Req,
} from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { AnalyticsOverviewDto } from './dto/analytics-overview.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { TokenPayload } from '../auth/dto/token-payload.dto'

@Controller('analytics')
@UseGuards(JwtGuard) // Bảo vệ tất cả các endpoint phân tích bằng JWT
export class AnalyticsController {
	constructor(private readonly analyticsService: AnalyticsService) {}

	/**
	 * Lấy dữ liệu tổng quan cho Dashboard cá nhân
	 * @Query range: '7d' | '30d' | '90d' | 'ytd'
	 */
	@Get('user/overview')
	async getUserOverview(
		@Req() request: Request,
		@Query('range') range: '7d' | '30d' | '90d' | 'ytd' = '30d'
	) {
		const user: TokenPayload = request['user']
		return this.analyticsService.getUserDashboard(user.sub, range)
	}

	/**
	 * Lấy dữ liệu phân tích hệ thống (Dành cho Admin)
	 */
	@Get('system/overview')
	async getSystemOverview(
		@Query() query: AnalyticsOverviewDto,
		@Req() request: Request
	) {
		const user: TokenPayload = request['user']
		// Hàm getOverview xử lý dữ liệu cấp cao (Cards, Financial, Top Performers)
		return this.analyticsService.getSystemOverview(query, user.sub)
	}
}
