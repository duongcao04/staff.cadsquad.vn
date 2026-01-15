import { queryOptions } from '@tanstack/react-query'
import lodash from 'lodash'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import type { IJobStatusResponse } from '@/shared/interfaces'
import type { TJobStatus } from '@/shared/types'
import { jobStatusApi } from '../../api'
import { COLORS, IMAGES, toDate } from '../../utils'

export const mapJobStatus: (item?: IJobStatusResponse) => TJobStatus = (
    item
) => ({
    id: item?.id ?? 'N/A',
    code: item?.code ?? 'UNKNOWN',
    displayName: item?.displayName ?? 'Unknown status',
    hexColor: item?.hexColor ?? COLORS.white,
    systemType: item?.systemType ?? JobStatusSystemTypeEnum.STANDARD,
    jobs: item?.jobs ?? [],
    order: item?.order ?? 0,
    icon: item?.icon ?? null,
    nextStatusOrder: item?.nextStatusOrder ?? null,
    prevStatusOrder: item?.prevStatusOrder ?? null,
    thumbnailUrl: item?.thumbnailUrl ?? IMAGES.cadsquadLogoOrange,
    createdAt: toDate(item?.createdAt),
    updatedAt: toDate(item?.updatedAt),
})

export const jobStatusesListOptions = () => {
    return queryOptions({
        queryKey: ['job-statuses'],
        queryFn: () => jobStatusApi.findAll(),
        select: (res) => {
            const jobStatusesData = res?.result
            return {
                jobStatuses: Array.isArray(jobStatusesData)
                    ? jobStatusesData.map(mapJobStatus)
                    : [],
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
            return lodash.isEmpty(statusData)
                ? undefined
                : mapJobStatus(statusData)
        },
    })
