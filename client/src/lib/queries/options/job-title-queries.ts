import { jobTitleApi } from '@/lib/api'
import { JobTitleSchema, TCreateJobTitleInput, TUpdateJobTitleInput } from '@/lib/validationSchemas'
import { parseData, parseList } from '@/lib/zod'
import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { onErrorToast } from '../helper'

// 1. Keys Factory
export const jobTitleQueryKeys = {
    resource: ['job-titles'] as const,
    lists: () => [...jobTitleQueryKeys.resource, 'lists'] as const,
    detail: (identify: string) => [...jobTitleQueryKeys.resource, 'identify', identify] as const,
}

// 2. Fetch Options
export const jobTitlesListOptions = () => {
    return queryOptions({
        queryKey: jobTitleQueryKeys.lists(),
        queryFn: () => jobTitleApi.findAll(),
        select: (res) => {
            const jobTitlesData = res?.result
            return {
                jobTitles: parseList(JobTitleSchema, jobTitlesData),
            }
        },
    })
}

export const jobTitleOptions = (identify: string) => {
    return queryOptions({
        queryKey: jobTitleQueryKeys.detail(identify),
        queryFn: () => jobTitleApi.findOne(identify),
        select: (res) => {
            const jobTitleData = res?.result
            return {
                jobTitle: parseData(JobTitleSchema, jobTitleData)
            }
        },
    })
}

// 3. Mutation Options
export const createJobTitleOptions = mutationOptions({
    mutationFn: (data: TCreateJobTitleInput) => jobTitleApi.create(data),
    onError: (err) => onErrorToast(err, 'Create failed'),
})

export const updateJobTitleOptions = mutationOptions({
    mutationFn: ({
        id,
        data,
    }: {
        id: string
        data: TUpdateJobTitleInput
    }) => jobTitleApi.update(id, data),
    onError: (err) => onErrorToast(err, 'Update failed'),
})

export const deleteJobTitleOptions = mutationOptions({
    mutationFn: (id: string) => jobTitleApi.remove(id),
    onError: (err) => onErrorToast(err, 'Delete failed'),
})