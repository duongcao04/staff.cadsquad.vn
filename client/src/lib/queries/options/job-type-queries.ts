import { queryOptions } from '@tanstack/react-query'

import { IJobTypeResponse } from '@/shared/interfaces'
import { TJobType } from '@/shared/types'

import { jobTypeApi } from '../../api'

export const mapJobType: (item?: IJobTypeResponse) => TJobType = (item) => ({
    code: item?.code,
    id: item?.id,
    displayName: item?.displayName ?? '',
    jobs: item?.jobs ?? [],
    hexColor: item?.hexColor ?? '',
    _count: item?._count ?? undefined,
})

export const jobTypesListOptions = () => {
    return queryOptions({
        queryKey: ['job-types'],
        queryFn: () => jobTypeApi.findAll(),
        select: (res) => {
            const jobTypesData = res?.result
            return {
                jobTypes: Array.isArray(jobTypesData)
                    ? jobTypesData.map(mapJobType)
                    : [],
            }
        },
    })
}
