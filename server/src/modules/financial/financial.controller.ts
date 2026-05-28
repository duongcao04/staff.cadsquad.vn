import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import {
    BadRequestResponseDto,
    UnauthorizedResponseDto,
} from '../../common/swagger/api-response.dto'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { BulkPayoutCommand } from './commands/impl/bulk-payout.command'
import { CreateTransactionCommand } from './commands/impl/create-transaction.command'
import { CreateTransactionDto } from './dtos/create-transaction.dto'
import { GetAllTransactionsQuery } from './queries/impl/get-all-transactions.query'
import { GetFinancialStatsQuery } from './queries/impl/get-financial-stats.query'
import { GetJobPayoutDetailQuery } from './queries/impl/get-job-payout-detail.query'
import { GetPayableJobsQuery } from './queries/impl/get-payable-jobs.query'
import { GetReceivableJobsQuery } from './queries/impl/get-receivable-jobs.query'
import { GetTransactionDetailQuery } from './queries/impl/get-transaction-detail.query'

@ApiTags('Financials')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('financials')
export class FinancialController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @Get('transactions')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy danh sách tất cả giao dịch',
        description:
            'Trả về danh sách giao dịch với phân trang và filter. `type` có thể là `INCOME` (thu) hoặc `EXPENSE` (chi).',
    })
    @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang', example: 20 })
    @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo referenceNo hoặc note', example: 'REF-2026' })
    @ApiQuery({ name: 'type', required: false, description: 'Lọc theo loại: INCOME hoặc EXPENSE', example: 'INCOME' })
    @ApiResponse({
        status: 200,
        description: 'Danh sách giao dịch có phân trang',
        schema: {
            example: {
                data: [
                    { id: 'uuid', amount: 5000000, type: 'INCOME', status: 'COMPLETED', referenceNo: 'REF-001' },
                ],
                total: 100,
                page: 1,
                limit: 20,
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAllTransactions(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Query('type') type: string
    ) {
        return this.queryBus.execute(new GetAllTransactionsQuery(page, limit, search, type))
    }

    @Get('transactions/:id')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy chi tiết một giao dịch',
        description: 'Trả về thông tin đầy đủ của giao dịch: số tiền, loại, trạng thái, job liên quan, bằng chứng.',
    })
    @ApiParam({ name: 'id', description: 'UUID của giao dịch', example: 'uuid-of-transaction' })
    @ApiResponse({ status: 200, description: 'Chi tiết giao dịch' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getTransactionDetail(@Param('id') id: string) {
        return this.queryBus.execute(new GetTransactionDetailQuery(id))
    }

    @Post('transactions')
    @HttpCode(201)
    @ApiOperation({
        summary: 'Ghi nhận giao dịch mới',
        description:
            'Tạo giao dịch mới: Thu từ khách (`INCOME`) hoặc Trả cho Staff (`EXPENSE`). Tự động cập nhật trạng thái tài chính của job liên quan.',
    })
    @ApiBody({ type: CreateTransactionDto })
    @ApiResponse({
        status: 201,
        description: 'Giao dịch đã được ghi nhận',
        schema: {
            example: {
                id: 'uuid',
                amount: 5000000,
                type: 'INCOME',
                status: 'COMPLETED',
                jobId: 'uuid-of-job',
            },
        },
    })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async createTransaction(
        @Req() request: Request,
        @Body() dto: CreateTransactionDto
    ) {
        const user: TokenPayload = request['user']
        return this.commandBus.execute(new CreateTransactionCommand(user.sub, dto))
    }

    @Get('receivable')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Danh sách công nợ phải thu (khách hàng nợ)',
        description:
            'Trả về danh sách jobs mà khách hàng chưa thanh toán đầy đủ. Phụ thuộc vào quyền của user: admin thấy tất cả, staff thấy job của mình.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách công nợ phải thu',
        schema: {
            example: [
                { jobId: 'uuid', jobNo: 'JOB-001', clientName: 'ABC Corp', outstanding: 3000000 },
            ],
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getReceivableJobs(@Req() request: Request) {
        const user: TokenPayload = request['user']
        return this.queryBus.execute(new GetReceivableJobsQuery(user.sub, user.permissions))
    }

    @Get('payable')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Danh sách công nợ phải trả (nợ tiền Staff)',
        description: 'Trả về danh sách assignments chưa được thanh toán cho staff.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách công nợ phải trả',
        schema: {
            example: [
                { assignmentId: 'uuid', staffName: 'Nguyễn Văn A', outstanding: 2000000 },
            ],
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getPayableJobs(@Req() request: Request) {
        const user: TokenPayload = request['user']
        return this.queryBus.execute(new GetPayableJobsQuery(user.sub))
    }

    @Get('stats')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Thống kê tổng quan tài chính',
        description:
            'Trả về tổng quan tài chính theo tháng: tổng thu (Revenue), tổng chi (Expense), lợi nhuận ròng (Profit).',
    })
    @ApiResponse({
        status: 200,
        description: 'Thống kê tài chính tháng hiện tại',
        schema: {
            example: {
                revenue: 150000000,
                expense: 60000000,
                profit: 90000000,
                period: 'monthly',
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getFinancialStats() {
        return this.queryBus.execute(new GetFinancialStatsQuery('monthly'))
    }

    @Post('bulk-payout')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Thanh toán hàng loạt cho nhiều jobs',
        description:
            'Ghi nhận giao dịch chi trả (EXPENSE) cho tất cả assignments trong danh sách `jobIds`. Dùng kênh `paymentChannelId` để thanh toán.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['jobIds'],
            properties: {
                jobIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Danh sách UUID job cần thanh toán cho staff',
                    example: ['uuid-job-1', 'uuid-job-2'],
                },
                paymentChannelId: {
                    type: 'string',
                    description: 'UUID kênh thanh toán (optional)',
                    example: 'uuid-of-payment-channel',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Thanh toán hàng loạt thành công' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async bulkPayout(
        @Req() req: Request,
        @Body() dto: { jobIds: string[]; paymentChannelId?: string }
    ) {
        const user: TokenPayload = req['user']
        return this.commandBus.execute(new BulkPayoutCommand(user.sub, dto.jobIds, dto.paymentChannelId))
    }

    @Get('payouts/job/:no')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Chi tiết đối soát Payout của một Job',
        description: 'Trả về lịch sử thanh toán và đối soát cho job theo số thứ tự (`jobNo`).',
    })
    @ApiParam({ name: 'no', description: 'Số thứ tự job (job number), ví dụ: JOB-001', example: 'JOB-001' })
    @ApiResponse({
        status: 200,
        description: 'Chi tiết payout của job',
        schema: {
            example: {
                jobNo: 'JOB-001',
                totalPayout: 5000000,
                transactions: [
                    { id: 'uuid', amount: 2500000, staffName: 'Nguyễn Văn A', paidAt: '2026-05-26' },
                ],
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getJobPayoutDetail(@Param('no') no: string) {
        return this.queryBus.execute(new GetJobPayoutDetailQuery(no))
    }
}
