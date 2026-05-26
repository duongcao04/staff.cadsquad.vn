import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { BadRequestResponseDto, UnauthorizedResponseDto } from '../../../common/swagger/api-response.dto'
import { JwtGuard } from '../../auth/jwt.guard'
import { AdminJobsService } from './admin-jobs.service'

@ApiTags('Admin — Jobs')
@ApiBearerAuth()
@Controller('admin/jobs')
@UseGuards(JwtGuard)
export class AdminJobsController {
    constructor(private readonly adminJobsService: AdminJobsService) {}

    @Get('stats')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Thống kê jobs theo khoảng thời gian',
        description:
            'Trả về số lượng job mới, hoàn thành, doanh thu trong khoảng `from` → `to`. Dùng cho biểu đồ admin dashboard.',
    })
    @ApiQuery({ name: 'from', required: false, description: 'Ngày bắt đầu (YYYY-MM-DD)', example: '2026-05-01' })
    @ApiQuery({ name: 'to', required: false, description: 'Ngày kết thúc (YYYY-MM-DD)', example: '2026-05-31' })
    @ApiResponse({
        status: 200,
        description: 'Thống kê job',
        schema: {
            example: {
                newJobs: 24,
                completedJobs: 18,
                totalRevenue: 85000000,
                byStatus: [{ status: 'COMPLETED', count: 18 }, { status: 'IN_PROGRESS', count: 6 }],
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getStats(@Query('from') from: string, @Query('to') to: string) {
        return this.adminJobsService.getStatsData({ from, to })
    }

    @Post('bulk-status')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Cập nhật trạng thái hàng loạt cho nhiều job',
        description: 'Chuyển tất cả job trong `jobIds` sang trạng thái `statusId`. Thao tác không thể hoàn tác.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['jobIds', 'statusId'],
            properties: {
                jobIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Danh sách UUID của jobs cần cập nhật',
                    example: ['uuid-1', 'uuid-2'],
                },
                statusId: {
                    type: 'string',
                    description: 'UUID của trạng thái mới',
                    example: 'uuid-of-completed-status',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Trạng thái đã được cập nhật cho tất cả job' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async bulkStatusUpdate(
        @Body('jobIds') jobIds: string[],
        @Body('statusId') statusId: string
    ) {
        return this.adminJobsService.bulkUpdateStatus(jobIds, statusId)
    }

    @Post('bulk-delete')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Xóa hàng loạt nhiều job (Admin)',
        description: 'Xóa vĩnh viễn tất cả job trong `jobIds`. Hành động không thể hoàn tác.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['jobIds'],
            properties: {
                jobIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Danh sách UUID của jobs cần xóa',
                    example: ['uuid-1', 'uuid-2'],
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Các job đã bị xóa' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async bulkDelete(@Body('jobIds') jobIds: string[]) {
        return this.adminJobsService.bulkDeleteJobs(jobIds)
    }
}
