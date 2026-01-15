import { queryOptions } from '@tanstack/react-query'

import type { IConfigResponse } from '@/shared/interfaces'
import type { TUserConfig } from '@/shared/types'

import { userConfigApi } from '../../api'

export const mapUserConfig: (item: IConfigResponse) => TUserConfig = (
    item
) => ({
    id: item.id,
    code: item.code,
    displayName: item.displayName ?? '',
    value: item.value ?? '',
    description: item.description ?? '',
    user: item.user,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
})

// --- Query Options ---

// 1. Danh sách notifications
export const userConfigListOptions = () => {
    return queryOptions({
        queryKey: ['user-configs'],
        queryFn: () => userConfigApi.getAllUserConfigs(),
        select: (res) => ({
            configs: Array.isArray(res.result)
                ? res.result.map(mapUserConfig)
                : [],
        }),
    })
}
export const jobColumnsConfigOptions = () => {
    return queryOptions({
        queryKey: ['user-configs', 'job-columns'],
        queryFn: () => userConfigApi.getJobShowColumns(),
        select: (res) => ({
            columns: res.result,
        }),
    })
}
