import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { jobFolderTemplateApi } from '../../api'
import { JobFolderTemplateSchema, TCreateJobFolderTemplateInput, TUpdateJobFolderTemplateInput } from '../../validationSchemas'
import { parseData, parseList } from '../../zod'
import { onErrorToast } from '../helper'

// 1. Key Factory (Quản lý Key tập trung)
export const jobFolderTemplateQueryKeys = {
    all: ['job-folder-templates'] as const,
    lists: () => [...jobFolderTemplateQueryKeys.all, 'list'] as const,
    detailById: (id: string) => [...jobFolderTemplateQueryKeys.all, 'detail', id] as const,
}

// 2. Fetch Queries
export const jobFolderTemplatesListOptions = () => {
    return queryOptions({
        queryKey: jobFolderTemplateQueryKeys.lists(),
        queryFn: () => jobFolderTemplateApi.findAll(),
        select: (res) => {
            const jobFolderTemplatesData = res?.result
            return {
                jobFolderTemplates: parseList(JobFolderTemplateSchema, jobFolderTemplatesData),
            }
        },
    })
}

export const jobFolderTemplateOptions = (id: string) => {
    return queryOptions({
        queryKey: jobFolderTemplateQueryKeys.detailById(id),
        queryFn: () => jobFolderTemplateApi.findOne(id),
        select: (res) => {
            const jobFolderTemplateData = res?.result
            return parseData(JobFolderTemplateSchema, jobFolderTemplateData)
        },
    })
}

// 3. Mutation Queries
export const createJobFolderTemplateOptions = () => {
    return mutationOptions({
        mutationFn: (data: TCreateJobFolderTemplateInput) => jobFolderTemplateApi.create(data)
    })
}

export const updateJobFolderTemplateOptions = () => {
    return mutationOptions({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: TUpdateJobFolderTemplateInput
        }) => jobFolderTemplateApi.update(id, data),
        onError: (err) => onErrorToast(err, "Update failed")
    })
}