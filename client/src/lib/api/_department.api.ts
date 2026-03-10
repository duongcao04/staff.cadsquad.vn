import { type ApiResponse, axiosClient } from '@/lib/axios'
import type {
    TCreateDepartmentInput,
    TUpdateDepartmentInput,
} from '@/lib/validationSchemas'

export const departmentApi = {
    create: (data: TCreateDepartmentInput) => {
        return axiosClient.post<ApiResponse<any>>(
            '/v1/departments',
            data
        )
    },

    findAll: async () => {
        return axiosClient
            .get<ApiResponse<any[]>>('/v1/departments')
            .then((res) => res.data)
    },

    findOne: async (id: string) => {
        return axiosClient
            .get<ApiResponse<any>>(`/v1/departments/${id}`)
            .then((res) => res.data)
    },

    update: (id: string, data: TUpdateDepartmentInput) => {
        return axiosClient.patch(
            `/v1/departments/${id}`,
            data
        )
    },

    remove: (id: string) => {
        return axiosClient.delete(`/v1/departments/${id}`)
    },
}
