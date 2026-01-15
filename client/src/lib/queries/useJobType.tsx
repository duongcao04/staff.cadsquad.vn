import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { jobTypeApi } from '@/lib/api'

import { mapJobType } from './options/job-type-queries'
export const useJobTypes = () => {
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['jobTypes'],
        queryFn: () => jobTypeApi.findAll(),
        select: (res) => res.result,
    })

    const jobTypes = useMemo(() => {
        const jobTypesData = data

        if (!Array.isArray(jobTypesData)) {
            return []
        }

        return jobTypesData.map((item) => mapJobType(item))
    }, [data])

    return {
        data: jobTypes ?? [],
        isLoading: isLoading || isFetching,
    }
}

export const useJobTypeDetail = (typeId?: string) => {
    const { data, refetch, error, isLoading, isFetching } = useQuery({
        queryKey: typeId ? ['jobTypes', typeId] : ['jobTypes'],
        queryFn: () => {
            if (!typeId) {
                return undefined
            }
            return jobTypeApi.findOne(typeId)
        },
        enabled: !!typeId,
        select: (res) => res?.data.result,
    })
    return {
        refetch,
        jobType: data,
        error,
        isLoading: isLoading || isFetching,
    }
}
