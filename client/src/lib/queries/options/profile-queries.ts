import { userApi } from '@/lib/api'
import { queryOptions } from '@tanstack/react-query'
import { parseList } from '../../zod'
import { JobSchema } from '../../validationSchemas'

export const profileScheduleOptions = (
    year: number,
    month: number,
    day?: number
) => {
    return queryOptions({
        queryKey: ['profile', 'schedule', year, month, day],
        queryFn: () => userApi.schedule(year, month, day),
        select: (res) => {
            const jobsData = res?.result?.jobsSchedule
            return {
                jobsSchedule: parseList(jobsData, JobSchema),
                total: jobsData?.length ?? 0,
            }
        },
    })
}
