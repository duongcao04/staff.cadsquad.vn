import { type ApiResponse, axiosClient } from '@/lib/axios'
import type {
    TCreateJobTypeInput,
    TUpdateJobTypeInput,
} from '@/lib/validationSchemas'
import type { IJobTypeResponse } from '@/shared/interfaces'

export const jobTypeApi = {
    create: (data: TCreateJobTypeInput) => {
        return axiosClient.post<ApiResponse<IJobTypeResponse>>(
            '/v1/job-types',
            data
        )
    },
    findAll: async () => {
        return axiosClient.get<ApiResponse<IJobTypeResponse[]>>('/v1/job-types').then(res => res.data)
    },
    findOne: (id: string) => {
        return axiosClient.get<ApiResponse<IJobTypeResponse>>(
            `/v1/job-types/${id}`
        )
    },
    update: (id: string, data: TUpdateJobTypeInput) => {
        return axiosClient.patch<ApiResponse<{ id: string }>>(
            `/v1/job-types/${id}`,
            data
        )
    },
    remove: (id: string) => {
        return axiosClient.delete(`/v1/job-types/${id}`)
    },
}
