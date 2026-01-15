import { queryOptions } from '@tanstack/react-query'
import { IJobTitleResponse } from '@/shared/interfaces'
import { TJobTitle } from '@/shared/types'
import { jobTitleApi } from '../../api'
import { toDate } from '../../utils'

export const mapJobTitle: (item?: IJobTitleResponse) => TJobTitle = (item) => ({
    id: item?.id ?? 'N/A',
    code: item?.code ?? 'UNKNOWN',
    users: item?.users ?? [],
    notes: item?.notes ?? null,
    displayName: item?.displayName ?? '',
    createdAt: toDate(item?.createdAt),
    updatedAt: toDate(item?.updatedAt ?? ''),
})

export const jobTitlesListOptions = () => {
    return queryOptions({
        queryKey: ['job-titles'],
        queryFn: () => jobTitleApi.findAll(),
        select: (res) => {
            const jobTitlesData = res?.result
            return {
                jobTitles: Array.isArray(jobTitlesData)
                    ? jobTitlesData.map(mapJobTitle)
                    : [],
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
            return mapJobTitle(jobTitleData)
        },
    })
}
