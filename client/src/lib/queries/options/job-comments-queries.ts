import { queryOptions } from '@tanstack/react-query';
import { jobApi, parseList } from '../..';
import { JobCommentSchema } from '../../validationSchemas';

export const jobCommentsOptions = (jobId: string) => {
    return queryOptions({
        queryKey: ['jobs', jobId, 'comments'],
        queryFn: async () => {
            const res = await jobApi.getComments(jobId);
            // Parse danh sách comments, Zod sẽ tự động parse đệ quy vào từng 'replies'
            return parseList(JobCommentSchema, res?.result);
        },
        select: (comments) => ({ comments })
    });
};
