import { useMutation } from '@tanstack/react-query'
import { imageApi } from '../api'
import { onErrorToast } from './helper'

export const useUploadImageMutation = () => {
    return useMutation({
        mutationFn: (image: File) => imageApi.upload(image),
        onError: (error) => onErrorToast(error, 'Failed to upload avatar'),
    })
}
