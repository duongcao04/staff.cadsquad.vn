import { queryOptions } from '@tanstack/react-query'
import { userConfigApi } from '../../api'

// --- Query Options ---
// 1. Danh sách notifications
export const userConfigListOptions = () => {
    return queryOptions({
        queryKey: ['user-configs'],
        queryFn: () => userConfigApi.getAllUserConfigs(),
        select: (res) => ({
            configs: res.result,
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
