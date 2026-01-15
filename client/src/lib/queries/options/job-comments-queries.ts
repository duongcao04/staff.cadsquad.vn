import { queryOptions } from '@tanstack/react-query'
import { jobApi } from '../..'
import { TJobComment } from '../../../shared/types'
import { toDate } from '../../utils'
import { mapUser } from './user-queries'

// Mapping helper để đồng bộ dữ liệu API -> Frontend
const mapComment = (item?: TJobComment): TJobComment => ({
    id: item?.id ?? 'N/A',
    content: item?.content ?? '',
    user: mapUser(item?.user),
    parentId: item?.parentId ?? null,
    // Đệ quy mapping cho các phản hồi nếu có
    replies: Array.isArray(item?.replies) ? item.replies.map(mapComment) : [],
    updatedAt: toDate(item?.updatedAt),
    createdAt: toDate(item?.createdAt),
})

/**
 * Options để lấy danh sách comment theo Job
 */
export const jobCommentsOptions = (jobId: string) => {
    return queryOptions({
        queryKey: ['comments', 'jobs', jobId],
        queryFn: () => jobApi.getComments(jobId),
        enabled: !!jobId,
        select: (res) => {
            const data = res?.result
            return {
                comments: Array.isArray(data) ? data.map(mapComment) : [],
            }
        },
    })
}
