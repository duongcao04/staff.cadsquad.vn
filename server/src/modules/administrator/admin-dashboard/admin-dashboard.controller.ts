import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { UnauthorizedResponseDto } from '../../../common/swagger/api-response.dto'
import { JwtGuard } from '../../auth/jwt.guard'
import { AdminDashboardService } from './admin-dashboard.service'

@ApiTags('Admin — Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(JwtGuard)
export class AdminDashboardController {
    constructor(private readonly dashboardService: AdminDashboardService) {}

    @Get('kpis')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy KPI tổng quan hệ thống',
        description:
            'Trả về các chỉ số KPI cấp cao: tổng user, tổng job, job hoàn thành, tổng doanh thu tháng hiện tại.',
    })
    @ApiResponse({
        status: 200,
        description: 'Dữ liệu KPI hệ thống',
        schema: {
            example: {
                totalUsers: 45,
                activeJobs: 32,
                completedThisMonth: 18,
                revenueThisMonth: 125000000,
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getKpis() {
        return this.dashboardService.getOverviewKpis()
    }

    @Get('db-stats')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Thống kê database (Admin)',
        description: 'Trả về số lượng bản ghi trong từng bảng chính của hệ thống.',
    })
    @ApiResponse({
        status: 200,
        description: 'Thống kê database',
        schema: {
            example: { users: 45, jobs: 312, transactions: 890, auditLogs: 5400 },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getDbStats() {
        return this.dashboardService.getDatabaseStats()
    }

    @Get('db-overview')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Tổng quan schema database (Admin)',
        description: 'Trả về thông tin cấu trúc và phân bố dữ liệu trong database.',
    })
    @ApiResponse({ status: 200, description: 'Database overview' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getDbOverviews() {
        return this.dashboardService.getDatabaseOverview()
    }
}
