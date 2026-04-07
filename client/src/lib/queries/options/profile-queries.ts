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
        queryKey: ['profile', 'schedule', `year=${year}`, `month=${month}`, `day=${day}`],
        queryFn: () => userApi.schedule(year, month, day),
        select: (res) => {
            const jobsData = res?.result?.jobsSchedule
            return {
                jobsSchedule: parseList(JobSchema, jobsData),
                total: jobsData?.length ?? 0,
            }
        },
    })
}
