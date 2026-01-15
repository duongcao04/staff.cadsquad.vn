import { type ApiResponse, axiosClient } from '@/lib/axios'
import type {
    TCreateDepartmentInput,
    TUpdateDepartmentInput,
} from '@/lib/validationSchemas'
import type { IDepartmentResponse } from '@/shared/interfaces'

export const departmentApi = {
    create: (data: TCreateDepartmentInput) => {
        return axiosClient.post<ApiResponse<IDepartmentResponse>>(
            '/v1/departments',
            data
        )
    },

    findAll: async () => {
        return axiosClient
            .get<ApiResponse<IDepartmentResponse[]>>('/v1/departments')
            .then((res) => res.data)
    },

    findOne: async (id: string) => {
        return axiosClient
            .get<ApiResponse<IDepartmentResponse>>(`/v1/departments/${id}`)
            .then((res) => res.data)
    },

    update: (id: string, data: TUpdateDepartmentInput) => {
        return axiosClient.patch<ApiResponse<{ id: string }>>(
            `/v1/departments/${id}`,
            data
        )
    },

    remove: (id: string) => {
        return axiosClient.delete(`/v1/departments/${id}`)
    },
}
