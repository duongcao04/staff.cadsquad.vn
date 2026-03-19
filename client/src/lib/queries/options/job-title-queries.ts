import { queryOptions } from '@tanstack/react-query'
import { jobTitleApi } from '../../api'
import { JobTitleSchema } from '../../validationSchemas'
import { parseData, parseList } from '../../zod'

export const jobTitlesListOptions = () => {
    return queryOptions({
        queryKey: ['job-titles'],
        queryFn: () => jobTitleApi.findAll(),
        select: (res) => {
            const jobTitlesData = res?.result
            return {
                jobTitles: parseList(JobTitleSchema, jobTitlesData),
            }
        },
    })
}

export const jobTitleOptions = (id: string) => {
    return queryOptions({
        queryKey: ['job-titles', 'id', id],
        queryFn: () => jobTitleApi.findOne(id),
        select: (res) => {
            const jobTitleData = res?.result
            return parseData(JobTitleSchema, jobTitleData)
        },
    })
}
