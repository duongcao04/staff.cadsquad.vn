import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { emailApi } from '../api'
import { ApiResponse } from '../axios'
import { SendEmailFormValues } from '../validationSchemas/_email.schema'
import { onErrorToast } from './helper'

export const useSendManualEmailMutation = (
    onSuccess?: (res: ApiResponse) => void
) => {
    return useMutation({
        mutationFn: (data: SendEmailFormValues) => emailApi.sendManual(data),
        onSuccess: (res) => {
            if (onSuccess) {
                onSuccess(res)
            } else {
                toast.success(res.message)
            }
        },
        onError: (error) => onErrorToast(error, 'Send email failed'),
    })
}
