import { BulkPayoutHandler } from './handlers/bulk-payout.handler'
import { CreateTransactionHandler } from './handlers/create-transaction.handler'

export const CommandHandlers = [CreateTransactionHandler, BulkPayoutHandler]
