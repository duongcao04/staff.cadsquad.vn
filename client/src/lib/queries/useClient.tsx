import { addToast } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '../../main'
import { clientApi, UpdateClientResponse } from '../api'
import { ApiResponse } from '../axios'
import { TEditClientFormValues } from '../validationSchemas'

export const useUpdateClientMutation = (
    onSuccess?: (res: ApiResponse<UpdateClientResponse>) => void
) => {
    return useMutation({
        mutationKey: ['updateJob'],
        mutationFn: ({
            clientId,
            data,
        }: {
            clientId: string
            data: TEditClientFormValues
        }) => clientApi.updateClient(clientId, data),
        onSuccess: (res) => {
            if (onSuccess) {
                onSuccess(res)
            } else {
                addToast({
                    title: 'Update client successfully',
                    color: 'success',
                })
            }
            queryClient.invalidateQueries({
                queryKey: ['clients', 'name', res.result?.name],
            })
            queryClient.invalidateQueries({
                queryKey: ['clients', 'id', res.result?.id],
            })
        },
    })
}
