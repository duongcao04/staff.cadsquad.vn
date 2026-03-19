import { queryOptions } from '@tanstack/react-query'
import { jobFolderTemplateApi } from '../../api'
import { JobFolderTemplateSchema } from '../../validationSchemas'
import { parseData, parseList } from '../../zod'

export const jobFolderTemplatesListOptions = () => {
    return queryOptions({
        queryKey: ['job-folder-templates'],
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
        queryKey: ['job-folder-templates', 'id', id],
        queryFn: () => jobFolderTemplateApi.findOne(id),
        select: (res) => {
            const jobFolderTemplateData = res?.result
            return parseData(JobFolderTemplateSchema, jobFolderTemplateData)
        },
    })
}