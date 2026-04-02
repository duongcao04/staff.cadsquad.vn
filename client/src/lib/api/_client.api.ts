import { type ApiResponse, axiosClient } from '@/lib/axios'
import queryString from 'query-string'
import { TEditClientFormValues } from '../validationSchemas'
export type UpdateClientResponse = {
    id: string
    name: string // Your partial update type
}

export const clientApi = {
    findAll: async (query: Record<string, string>) => {
        const queryStringFormatter = queryString.stringify(query, {
            arrayFormat: 'comma',
        })
        return axiosClient
            .get<
                ApiResponse<any[]>
            >(`/v1/clients?${queryStringFormatter}`)
            .then((res) => res.data)
    },
    findClientByName: (name: string) =>
        axiosClient
            .get<ApiResponse<any>>(`/v1/clients/search-by-name`, {
                params: { name },
            })
            .then((res) => res.data),
    findOne: async (id: string) => {
        return axiosClient
            .get<ApiResponse<any>>(`/v1/clients/${id}`)
            .then((res) => res.data)
    },

    create: (data: TEditClientFormValues) =>
        axiosClient
            .post<ApiResponse<UpdateClientResponse>>(`/v1/clients`, data)
            .then((res) => res.data),
    updateClient: (id: string, data: TEditClientFormValues) =>
        axiosClient
            .patch<ApiResponse<UpdateClientResponse>>(`/v1/clients/${id}`, data)
            .then((res) => res.data),
}
