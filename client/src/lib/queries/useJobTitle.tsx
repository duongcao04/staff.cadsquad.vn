import { jobTitleApi } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    type TCreateJobTitleInput,
    type TUpdateJobTitleInput,
} from '../validationSchemas'

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
