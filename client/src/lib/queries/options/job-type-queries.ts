import { queryOptions } from '@tanstack/react-query'
import { jobTypeApi } from '../../api'
import { JobTypeSchema } from '../../validationSchemas'
import { parseList } from '../../zod'

export const jobTypesListOptions = () => {
    return queryOptions({
        queryKey: ['job-types'],
        queryFn: () => jobTypeApi.findAll(),
        select: (res) => {
            const jobTypesData = res?.result
            return {
                jobTypes: parseList(JobTypeSchema, jobTypesData),
            }
        },
    })
}
