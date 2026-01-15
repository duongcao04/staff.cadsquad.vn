import { userApi } from '@/lib/api'
import { queryOptions } from '@tanstack/react-query'
import { mapJob } from './job-queries'

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
                jobsSchedule: Array.isArray(jobsData)
                    ? jobsData.map(mapJob)
                    : [],
                total: jobsData?.length ?? 0,
            }
        },
    })
}
