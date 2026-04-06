import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { BulkPayoutCommand } from './commands/impl/bulk-payout.command'
import { CreateTransactionCommand } from './commands/impl/create-transaction.command'
import { CreateTransactionDto } from './dtos/create-transaction.dto'
import { GetAllTransactionsQuery } from './queries/impl/get-all-transactions.query'
import { GetFinancialStatsQuery } from './queries/impl/get-financial-stats.query'
import { GetPayableJobsQuery } from './queries/impl/get-payable-jobs.query'
import { GetReceivableJobsQuery } from './queries/impl/get-receivable-jobs.query'
import { GetTransactionDetailQuery } from './queries/impl/get-transaction-detail.query'
import { GetJobPayoutDetailQuery } from './queries/impl/get-job-payout-detail.query'

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
	@ApiOperation({ summary: 'Get all transaction successfully' })
	async getAllTransactions(
		@Query('page') page: number,
		@Query('limit') limit: number,
		@Query('search') search: string,
		@Query('type') type: string
	) {
		return this.queryBus.execute(
			new GetAllTransactionsQuery(page, limit, search, type)
		)
	}

	@Get('transactions/:id')
	@ApiOperation({ summary: 'Get transaction detail successfully' })
	async getTransactionDetail(@Param('id') id: string) {
		return this.queryBus.execute(new GetTransactionDetailQuery(id))
	}

	@Post('transactions')
	@ApiOperation({
		summary: 'Ghi nhận giao dịch mới (Thu từ khách hoặc Trả cho Staff)',
	})
	async createTransaction(
		@Req() request: Request,
		@Body() dto: CreateTransactionDto
	) {
		const user: TokenPayload = request['user']
		return this.commandBus.execute(
			new CreateTransactionCommand(user.sub, dto)
		)
	}

	@Get('receivable')
	@ApiOperation({ summary: 'Danh sách công nợ phải thu (Khách nợ)' })
	async getReceivableJobs(@Req() request: Request) {
		const user: TokenPayload = request['user']
		return this.queryBus.execute(
			new GetReceivableJobsQuery(user.sub, user.permissions)
		)
	}

	@Get('payable')
	@ApiOperation({ summary: 'Danh sách công nợ phải trả (Nợ tiền Staff)' })
	async getPayableJobs(@Req() request: Request) {
		const user: TokenPayload = request['user']
		return this.queryBus.execute(new GetPayableJobsQuery(user.sub))
	}

	@Get('stats')
	@ApiOperation({
		summary: 'Thống kê tổng quan tài chính (Revenue, Expense, Profit)',
	})
	async getFinancialStats() {
		// Có thể mở rộng thêm filter theo tháng/năm ở đây
		return this.queryBus.execute(new GetFinancialStatsQuery('monthly'))
	}

	@Post('bulk-payout')
	@ApiOperation({ summary: 'Thanh toán hàng loạt cho các Job đã chọn' })
	async bulkPayout(
		@Req() req: Request,
		@Body() dto: { jobIds: string[]; paymentChannelId?: string }
	) {
		const user: TokenPayload = req['user']
		return this.commandBus.execute(
			new BulkPayoutCommand(user.sub, dto.jobIds, dto.paymentChannelId)
		)
	}

	@Get('payouts/job/:no')
	@ApiOperation({ summary: 'Chi tiết đối soát Payout của một Job cụ thể' })
	async getJobPayoutDetail(@Param('no') no: string) {
		return this.queryBus.execute(new GetJobPayoutDetailQuery(no))
	}
}
