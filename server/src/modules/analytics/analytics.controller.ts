import {
    Controller,
    Get,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { UnauthorizedResponseDto } from '../../common/swagger/api-response.dto'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { AnalyticsService } from './analytics.service'
import { AnalyticsOverviewDto } from './dto/analytics-overview.dto'

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('user/overview')
    @ApiOperation({
        summary: 'Dashboard cá nhân — tổng quan hiệu suất',
        description:
            'Trả về KPI cá nhân: số job hoàn thành, doanh thu, điểm hiệu suất theo khoảng thời gian.',
    })
    @ApiQuery({
        name: 'range',
        required: false,
        description: 'Khoảng thời gian thống kê: 7d, 30d, 90d hoặc ytd (năm tới hiện tại)',
        enum: ['7d', '30d', '90d', 'ytd'],
        example: '30d',
    })
    @ApiResponse({
        status: 200,
        description: 'Dữ liệu tổng quan cá nhân',
        schema: {
            example: {
                success: true,
                message: '',
                result: {
                    totalJobs: 24,
                    completedJobs: 18,
                    totalRevenue: 45000000,
                    performanceScore: 87.5,
                },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getUserOverview(
        @Req() request: Request,
        @Query('range') range: '7d' | '30d' | '90d' | 'ytd' = '30d'
    ) {
        const user: TokenPayload = request['user']
        return this.analyticsService.getUserDashboard(user.sub, range)
    }

    @Get('system/overview')
    @ApiOperation({
        summary: 'Dashboard hệ thống — tổng quan toàn công ty (Admin)',
        description:
            'Trả về KPI cấp cao: tổng doanh thu, chi phí, lợi nhuận, top performers, phân bổ job theo trạng thái.',
    })
    @ApiResponse({
        status: 200,
        description: 'Dữ liệu tổng quan hệ thống',
        schema: {
            example: {
                success: true,
                message: '',
                result: {
                    totalRevenue: 500000000,
                    totalExpense: 200000000,
                    netProfit: 300000000,
                    topPerformers: [{ userId: 'uuid', name: 'Nguyễn Văn A', score: 95 }],
                },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getSystemOverview(
        @Query() query: AnalyticsOverviewDto,
        @Req() request: Request
    ) {
        const user: TokenPayload = request['user']
        return this.analyticsService.getSystemOverview(query, user.sub)
    }
}
