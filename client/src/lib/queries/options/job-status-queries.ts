import { queryOptions } from '@tanstack/react-query'
import { jobStatusApi } from '../../api'
import { JobStatusSchema } from '../../validationSchemas'
import { parseData, parseList } from '../../zod'

export const jobStatusesListOptions = () => {
    return queryOptions({
        queryKey: ['job-statuses'],
        queryFn: () => jobStatusApi.findAll(),
        select: (res) => {
            const jobStatusesData = res?.result
            return {
                jobStatuses: parseList(JobStatusSchema, jobStatusesData),
            }
        },
    })
}

export const statusByOrderOptions = (order: number) =>
    queryOptions({
        queryKey: ['job-statuses', 'order', order],
        queryFn: () => jobStatusApi.findByOrder(order),
        select: (res) => {
            const statusData = res?.result
            return parseData(JobStatusSchema, statusData)
        },
    })
