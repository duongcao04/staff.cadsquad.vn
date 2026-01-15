import { toFormData } from 'axios';

import { type ApiResponse, axiosClientMultipart } from '@/lib/axios'

export const imageApi = {
    upload: async (image: File) => {
        const formData = new FormData();
        formData.append('image', image, image.name)
        formData.append('description', 'test')
        console.log(toFormData(formData));
        for (const pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        return await axiosClientMultipart
            .post<ApiResponse<{ secure_url: string }>>(
                '/v1/upload/image', formData
            )
            .then((res) => res.data.result?.secure_url)
    },
}
