import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { jobTitleApi } from '../../api'
import { JobTitleSchema, TCreateJobTitleInput, TUpdateJobTitleInput } from '../../validationSchemas'
import { parseData, parseList } from '../../zod'
import { onErrorToast } from '../helper'

// 1. Keys Factory
export const jobTitleQueryKeys = {
    resource: ['job-titles'] as const,
    lists: () => [...jobTitleQueryKeys.resource, 'lists'] as const,
    detail: (id: string) => [...jobTitleQueryKeys.resource, 'identify', id] as const,
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

export const jobTitleOptions = (id: string) => {
    return queryOptions({
        queryKey: jobTitleQueryKeys.detail(id),
        queryFn: () => jobTitleApi.findOne(id),
        select: (res) => {
            const jobTitleData = res?.result
            return parseData(JobTitleSchema, jobTitleData)
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