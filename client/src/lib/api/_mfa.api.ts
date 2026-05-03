import { axiosClient } from '@/lib/axios'

export const mfaApi = {
    generateQrCode: async () => {
        return axiosClient.get(`/v1/mfa/generate`).then((res) => res.data)
    },
    turnOn: async (code: string) => {
        return axiosClient
            .post(`/v1/mfa/turn-on`, { code })
            .then((res) => res.data)
    },
}
