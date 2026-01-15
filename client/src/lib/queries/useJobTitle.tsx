import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { jobTitleApi } from '@/lib/api'

import {
    type TCreateJobTitleInput,
    type TUpdateJobTitleInput,
} from '../validationSchemas'
import { mapJobTitle } from './options/job-title-queries'

export const useJobTitles = () => {
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['job-titles'],
        queryFn: () => jobTitleApi.findAll(),
        select: (res) => res.result,
    })

    const jobTitles = useMemo(() => {
        const jobTitlesData = data

        if (!Array.isArray(jobTitlesData)) {
            return []
        }

        return jobTitlesData.map((item) => mapJobTitle(item))
    }, [data])

    return {
        jobTitles: jobTitles ?? [],
        data: jobTitles ?? [],
        isLoading: isLoading || isFetching,
    }
}

export const useJobTitleById = (id: string) =>
    useQuery({
        queryKey: ['job-titles', id],
        queryFn: () => {
            if (!id) {
                return undefined
            }
            return jobTitleApi.findOne(id)
        },
        select: (res) => res?.result,
        enabled: !!id,
    })

export const useCreateJobTitle = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: TCreateJobTitleInput) => jobTitleApi.create(data),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['job-titles'] }),
    })
}

export const useUpdateJobTitle = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: TUpdateJobTitleInput
        }) => jobTitleApi.update(id, data),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['job-titles'] }),
    })
}

export const useDeleteJobTitle = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => jobTitleApi.remove(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['job-titles'] }),
    })
}
