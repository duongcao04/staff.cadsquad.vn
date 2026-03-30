import { FindAllJobsHandler } from './impl/find-all-jobs.query'
import { FindJobByNoHandler } from './impl/find-job-by-no.query'
import { FindJobsByDeadlineHandler } from './impl/find-jobs-by-deadline.query'
import { FindJobsPendingPayoutsHandler } from './impl/find-jobs-pending-payouts'
import { FindJobsToDeliverHandler } from './impl/find-jobs-to-deliver'
import { GetMonthlyDeadlinesHandler } from './impl/get-monthly-deadlines.query'

export const QueryHandlers = [
    FindAllJobsHandler,
    FindJobsByDeadlineHandler,
    FindJobByNoHandler,
    FindJobsPendingPayoutsHandler,
    FindJobsToDeliverHandler,
    GetMonthlyDeadlinesHandler,
]
