import { type ApiResponse, axiosClient } from '@/lib/axios'
import type {
    TCreatePaymentChannelInput,
    TUpdatePaymentChannelInput,
} from '@/lib/validationSchemas'
import type { IPaymentChannelResponse } from '@/shared/interfaces'

export const paymentChannelApi = {
    create: (data: TCreatePaymentChannelInput) => {
        return axiosClient.post('/v1/payment-channels', data)
    },
    findAll: async () => {
        return axiosClient.get<ApiResponse<IPaymentChannelResponse[]>>(
            '/v1/payment-channels'
        ).then(res => res.data)
    },
    findOne: (id: string) => {
        return axiosClient.get<ApiResponse<IPaymentChannelResponse>>(
            `/v1/payment-channels/${id}`
        )
    },
    update: (id: string, data: TUpdatePaymentChannelInput) => {
        return axiosClient.patch<ApiResponse<{ id: string }>>(
            `/v1/payment-channels/${id}`,
            data
        )
    },
    remove: (id: string) => {
        return axiosClient.delete(`/v1/payment-channels/${id}`)
    },
}
