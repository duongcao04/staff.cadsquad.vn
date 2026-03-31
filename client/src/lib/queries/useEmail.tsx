import { useMutation } from '@tanstack/react-query'
import { emailApi } from '../api'
import { ApiResponse } from '../axios'
import { SendEmailFormValues } from '../validationSchemas/_email.schema'
import { onErrorToast } from './helper'
import { addToast } from '@heroui/react'

export const useSendManualEmailMutation = (
    onSuccess?: (res: ApiResponse) => void
) => {
    return useMutation({
        mutationFn: (data: SendEmailFormValues) => emailApi.sendManual(data),
        onSuccess: (res) => {
            if (onSuccess) {
                onSuccess(res)
            } else {
                addToast({ title: res.message, color: 'success' })
            }
        },
        onError: (error) => onErrorToast(error, 'Send email failed'),
    })
}
