import { type ApiResponse, axiosClient } from '@/lib/axios'
import type {
    TCreateJobFolderTemplateInput,
    TUpdateJobFolderTemplateInput,
} from '@/lib/validationSchemas'

export const jobFolderTemplateApi = {
    create: (data: TCreateJobFolderTemplateInput) =>
        axiosClient.post<ApiResponse<any>>(
            '/v1/job-folder-templates',
            data
        ),
    findAll: async () =>
        axiosClient.get<ApiResponse<any[]>>('/v1/job-folder-templates').then(res => res.data),
    findOne: async (id: string) =>
        axiosClient.get<ApiResponse<any>>(`/v1/job-folder-templates/${id}`).then(res => res.data),
    update: (id: string, data: TUpdateJobFolderTemplateInput) =>
        axiosClient.patch<ApiResponse<{ id: string }>>(
            `/v1/job-folder-templates/${id}`,
            data
        ),
    remove: (id: string) => axiosClient.delete(`/v1/job-folder-templates/${id}`),
}
