import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { jobApi, onErrorToast, parseList } from '../..';
import { JobCommentSchema, TCreateCommentInput } from '../../validationSchemas';

// 1. Keys factory
export const jobCommentQueryKeys = {
    resource: ['jobs', 'comments'] as const,
    lists: (jobId: string) => [...jobCommentQueryKeys.resource, jobId] as const,
}

export const jobCommentsOptions = (jobId: string) => {
    return queryOptions({
        queryKey: jobCommentQueryKeys.lists(jobId),
        queryFn: async () => {
            const res = await jobApi.getComments(jobId);
            return parseList(JobCommentSchema, res?.result);
        },
        select: (comments) => ({ comments })
    });
};


export const createJobCommentOptions = mutationOptions({
    mutationFn: ({
        jobId,
        data,
    }: {
        jobId: string
        data: TCreateCommentInput
    }) => {
        return jobApi.createComment(jobId, data)
    },
    onError: (err) => onErrorToast(err, 'Comment failed'),
})