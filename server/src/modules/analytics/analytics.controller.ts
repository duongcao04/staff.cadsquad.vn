import { RequirePermissions } from '@/common/decorators/require-permissions.decorator'
import { PermissionsGuard } from '@/common/guards/permissions.guard'
import { TokenPayload } from '@/modules/auth/dto/token-payload.dto'
import { JwtGuard } from '@/modules/auth/jwt.guard'
import { APP_PERMISSIONS } from '@/utils/_app-permissions'
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiQuery } from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service'
import { AnalyticsOverviewDto } from './dto/analytics-overview.dto'

@Controller('analytics')
@UseGuards(JwtGuard)
export class AnalyticsController {
	constructor(private readonly analyticsService: AnalyticsService) {}

	@Get('overview')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.ANALYTICS.READ)
	async getOverview(
		@Req() request: Request,
		@Query() query: AnalyticsOverviewDto
	) {
		const userPayload: TokenPayload = await request['user']
		return this.analyticsService.getOverview(query, userPayload.sub)
	}

	@Get('revenue')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.ANALYTICS.READ)
	async getRevenue(@Query('from') from?: string, @Query('to') to?: string) {
		return this.analyticsService.getRevenueAnalytics(from, to)
	}

	@Get('profile-overview')
	@ApiOperation({
		summary: 'Get user financial overview, job stats, and charts',
	})
	@ApiQuery({
		name: 'from',
		required: false,
		type: String,
		description: 'Start date (YYYY-MM-DD)',
	})
	@ApiQuery({
		name: 'to',
		required: false,
		type: String,
		description: 'End date (YYYY-MM-DD)',
	})
	@ApiQuery({
		name: 'unit',
		required: false,
		enum: ['day', 'month'],
		description: 'Grouping unit for charts',
	})
	async getUserOverview(
		@Req() request: Request,
		@Query('from') from?: string,
		@Query('to') to?: string,
		@Query('unit') unit: 'day' | 'month' = 'month'
	) {
		const userPayload: TokenPayload = await request['user']
		return this.analyticsService.getUserOverview(userPayload.sub)
	}
}
