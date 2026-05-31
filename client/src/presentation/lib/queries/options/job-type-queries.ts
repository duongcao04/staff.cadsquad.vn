import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { jobTypeApi } from '../../api'
import { JobTypeSchema, TCreateJobTypeInput, TUpdateJobTypeInput } from '../../validationSchemas'
import { parseData, parseList } from '../../zod'
import { onErrorToast } from '../helper'

// 1. Keys Factory
export const jobTypeQueryKeys = {
    resource: ['job-types'] as const,
    lists: () => [...jobTypeQueryKeys.resource, 'lists'] as const,
    detail: (identify: string) => [...jobTypeQueryKeys.resource, 'identify', identify] as const,
}


export const jobTypesListOptions = () => {
    return queryOptions({
        queryKey: jobTypeQueryKeys.lists(),
        queryFn: () => jobTypeApi.findAll(),
        select: (res) => {
            const jobTypesData = res?.result
            return {
                jobTypes: parseList(JobTypeSchema, jobTypesData),
            }
        },
    })
}

export const jobTypeDetailOptions = (id: string) => {
    return queryOptions({
        queryKey: jobTypeQueryKeys.detail(id),
        queryFn: () => jobTypeApi.findOne(id),
        select: (res) => {
            const jobTypesData = res?.result
            return parseData(JobTypeSchema, jobTypesData)
        },
    })
}

export const updateJobTypeOptions = (id: string) => {
    return mutationOptions({
        mutationFn: (data: TUpdateJobTypeInput) => jobTypeApi.update(id, data),
        onError: (err: any) =>
            onErrorToast(err, 'Update failed'),
    })
}

export const createJobTypeOptions = () => {
    return mutationOptions({
        mutationFn: (data: TCreateJobTypeInput) => jobTypeApi.create(data),
        onError: (err: any) =>
            onErrorToast(err, 'Create failed'),
    })
}
