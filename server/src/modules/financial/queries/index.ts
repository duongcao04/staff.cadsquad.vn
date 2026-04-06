import {
	GetAllTransactionsHandler,
	GetAllTransactionsQuery,
} from './impl/get-all-transactions.query'
import { GetFinancialStatsHandler } from './impl/get-financial-stats.query'
import { GetPayableJobsHandler } from './impl/get-payable-jobs.query'
import { GetReceivableJobsHandler } from './impl/get-receivable-jobs.query'
import { GetTransactionDetailHandler } from './impl/get-transaction-detail.query'

export const QueryHandlers = [
	GetPayableJobsHandler,
	GetReceivableJobsHandler,
	GetFinancialStatsHandler,
	GetAllTransactionsHandler,
	GetTransactionDetailHandler,
]

