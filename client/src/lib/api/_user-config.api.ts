import { type ApiResponse, axiosClient } from '@/lib/axios'
import type { TUpdateUserConfigInput } from '@/lib/validationSchemas'
import type { IConfigResponse } from '@/shared/interfaces'

export const userConfigApi = {
    getAllUserConfigs: async () => {
        return axiosClient
            .get<ApiResponse<IConfigResponse[]>>('/v1/config')
            .then((res) => res.data)
    },
    getByCode: async (code: string) => {
        return axiosClient
            .get<ApiResponse<IConfigResponse>>(`/v1/config/${code}`)
            .then((res) => res.data)
    },
    getJobShowColumns: async () => {
        return axiosClient
            .get<
                ApiResponse<
                    {
                        label: string
                        key: string
                        sortable: boolean
                        description: string
                    }[]
                >
            >(`/v1/config/jobs-columns`)
            .then((res) => res.data)
    },
    updateByCode: async (code: string, data: TUpdateUserConfigInput) => {
        return axiosClient
            .patch<
                ApiResponse<{ code: string }>
            >(`/v1/config/code/${code}`, data)
            .then((res) => res.data)
    },
}
