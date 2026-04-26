import { type ApiResponse, axiosClientMultipart } from '@/lib/axios'
import { toFormData } from 'axios'

export const imageApi = {
    upload: async (image: File) => {
        const payload = {
            image: image,
            description: 'test',
        }

        return await axiosClientMultipart
            .post<
                ApiResponse<{ secure_url: string }>
            >('/v1/upload/image', toFormData(payload))
            .then((res) => res.data.result?.secure_url)
    },
}
