import { jobFolderTemplateApi } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    type TCreateJobFolderTemplateInput,
    type TUpdateJobFolderTemplateInput,
} from '../validationSchemas'

export const useCreateJobFolderTemplate = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: TCreateJobFolderTemplateInput) => jobFolderTemplateApi.create(data),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['job-folder-templates'] }),
    })
}

export const useUpdateJobFolderTemplate = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: TUpdateJobFolderTemplateInput
        }) => jobFolderTemplateApi.update(id, data),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['job-folder-templates'] }),
    })
}

export const useDeleteJobFolderTemplate = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => jobFolderTemplateApi.remove(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['job-folder-templates'] }),
    })
}