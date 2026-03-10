import { type ApiResponse, axiosClient } from '@/lib/axios'
import type {
    TCreateJobStatusInput,
    TUpdateJobStatusInput,
} from '@/lib/validationSchemas'

export const jobStatusApi = {
    create: (data: TCreateJobStatusInput) => {
        return axiosClient.post<ApiResponse<any>>(
            '/v1/job-statuses',
            data
        )
    },
    findAll: async () => {
        return axiosClient
            .get<ApiResponse<any[]>>('/v1/job-statuses')
            .then((res) => res.data)
    },
    findOne: (id: string) => {
        return axiosClient.get<ApiResponse<any>>(
            `/v1/job-statuses/${id}`
        )
    },
    findByOrder: async (orderNum: number) => {
        return axiosClient
            .get<
                ApiResponse<any>
            >(`/v1/job-statuses/order/${orderNum}`)
            .then((res) => res.data)
    },
    update: (id: string, data: TUpdateJobStatusInput) => {
        return axiosClient.patch<ApiResponse<{ id: string }>>(
            `/v1/job-statuses/${id}`,
            data
        )
    },
    remove: (id: string) => {
        return axiosClient.delete(`/v1/job-statuses/${id}`)
    },
}
