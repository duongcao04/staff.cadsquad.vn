import { useQuery } from '@tanstack/react-query'

import {
    jobColumnsConfigOptions,
    userConfigListOptions,
} from './options/user-config-queries'

export const useUserConfigs = () => {
    const { data, isFetching, isLoading } = useQuery(userConfigListOptions())
    return {
        isLoading: isLoading || isFetching,
        configs: data?.configs ?? [],
    }
}
export const useJobColumnsConfig = () => {
    const { data, isFetching, isLoading } = useQuery(jobColumnsConfigOptions())
    return {
        isLoading: isLoading || isFetching,
        configs: data?.columns ?? [],
    }
}
