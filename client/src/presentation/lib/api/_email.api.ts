import { ApiResponse, axiosClient } from '../axios'
import { SendEmailFormValues } from '../validationSchemas/_email.schema'

export const emailApi = {
    sendManual: async (data: SendEmailFormValues) => {
        return axiosClient
            .post<ApiResponse>('/v1/email/send', data)
            .then((res) => res.data)
    },
}
