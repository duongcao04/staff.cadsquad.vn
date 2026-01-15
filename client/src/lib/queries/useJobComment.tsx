import { addToast } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TCreateCommentInput } from '@/lib/validationSchemas'
import { ApiResponse, jobApi } from '..'
import { onErrorToast } from './helper'
import { jobByNoOptions } from './options/job-queries'

export const useCreateJobCommentMutation = (
    onSuccess?: (res: ApiResponse<{ id: string; no: string }>) => void
) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['jobs', 'comment', 'create'],

        // Data là input từ form (content, parentId?)
        mutationFn: ({
            jobId,
            data,
        }: {
            jobId: string
            data: TCreateCommentInput
        }) => {
            // Đảm bảo request gửi đúng jobId
            return jobApi.createComment(jobId, data)
        },

        onSuccess: (res) => {
            // 1. Hiển thị thông báo thành công
            if (onSuccess) {
                onSuccess(res)
            } else {
                addToast({
                    title: 'Bình luận thành công',
                    color: 'success',
                    variant: 'flat',
                })
            }

            // 2. Làm mới danh sách comment của Job này
            // Sử dụng chính xác queryKey từ jobCommentsOptions
            if (res.result?.no) {
                queryClient.refetchQueries({
                    queryKey: jobByNoOptions(res.result?.no).queryKey,
                })
            }

            // // 3. Nếu là reply, có thể cần invalidate cả query chi tiết comment cha
            // const newComment = res.data.result
            // if (newComment?.parentId) {
            //     queryClient.invalidateQueries({
            //         queryKey: ['comments', 'id', newComment.parentId],
            //     })
            // }
        },

        onError: (err) => onErrorToast(err, 'Have an error!'),
    })
}
