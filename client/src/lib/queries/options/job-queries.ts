import { jobApi } from '@/lib/api'
import {
    JobActivityLogSchema,
    JobSchema,
    TAssignMember,
    TBulkChangeStatusInput,
    TChangeStatusInput,
    TCreateJobFormValues,
    TDeliverJobInput,
    TJobQueryInput,
    TRescheduleJob,
    TUpdateJobInput,
    TUpdateJobRevenue,
    UserSchema,
} from '@/lib/validationSchemas'
import { mutationOptions, queryOptions } from '@tanstack/react-query'
import lodash from 'lodash'
import queryString from 'query-string'
import { JobDeliverySchema } from '../../validationSchemas/_job-delivery.schema'
import { parseData, parseList } from '../../zod'
import { onErrorToast } from '../helper'

export const jobQueryKeys = {
    resource: ['jobs'] as const,
    lists: (params: TJobQueryInput) => {
        const { page, limit, search, tab, sort, ...filters } = params

        return [
            ...jobQueryKeys.resource,
            'lists',
            `tab=${tab}`,
            `limit=${limit}`,
            `page=${page}`,
            `keywords=${search}`,
            `sort=${sort}`,
            `filters=${queryString.stringify(filters)}`,
        ] as const
    },
    search: (keyword?: string) => [...jobQueryKeys.resource, 'search', keyword] as const,
    detail: (id: string) => [...jobQueryKeys.resource, 'identify', id] as const,
    detailByNo: (no: string) =>
        [...jobQueryKeys.resource, 'detail', no] as const,
}

// --- Query Options ---
// 1. Danh sách Jobs
export const jobsListOptions = (
    params: TJobQueryInput = {
        page: 1,
        limit: 10,
        isAll: '0',
        sort: ['displayName:asc'],
    }
) => {
    return queryOptions({
        queryKey: jobQueryKeys.lists(params),
        queryFn: () => {
            const newParams = lodash.omitBy(params, lodash.isUndefined)
            return jobApi.findAll(newParams)
        },
        select: (res) => {
            const jobs = parseList(JobSchema, res.result?.data)
            return {
                jobs,
                paginate: res.result?.paginate,
            }
        },
    })
}

// 1. Danh sách Jobs
export const workbenchDataOptions = (
    params: Omit<TJobQueryInput, 'tab' | 'isAll' | 'hideFinishItems'> = {
        page: 1,
        limit: 10,
        sort: ['displayName:asc'],
    }
) => {
    const { page, limit, search, sort, ...filters } = params

    return queryOptions({
        queryKey: [
            'workbench-data',
            `limit=${limit}`,
            `page=${page}`,
            `keywords=${search}`,
            `sort=${sort}`,
            `filters=${queryString.stringify(filters)}`,
        ],
        queryFn: () => {
            const newParams = lodash.omitBy(params, lodash.isUndefined)
            return jobApi.workbenchData({
                ...newParams,
            })
        },
        // ✅ Select & Map data ngay tại đây
        select: (res) => {
            return {
                jobs: parseList(JobSchema, res.result?.data),
                paginate: res.result?.paginate,
            }
        },
    })
}

// 2. Tìm kiếm Jobs
export const jobsSearchOptions = (keywords?: string) =>
    queryOptions({
        queryKey: jobQueryKeys.search(keywords),
        queryFn: () => {
            if (!keywords) return null
            return jobApi.searchJobs(keywords)
        },
        enabled: !!keywords,
        select: (res) => parseList(JobSchema, res?.result),
    })

export const jobDeliveriesListOptions = (jobId: string) =>
    queryOptions({
        queryKey: ['jobs', 'deliveries', jobId],
        queryFn: () => jobApi.jobDeliveries(jobId),
        select: (res) => {
            const jobDeliveries = parseList(JobDeliverySchema, res?.result)
            return {
                jobDeliveries,
            }
        },
    })

export const jobsPendingDeliverOptions = () =>
    queryOptions({
        queryKey: ['jobs', 'pending-deliver'],
        queryFn: () => jobApi.pendingDeliver(),
        select: (res) => parseList(JobSchema, res.result),
    })

export const jobsPendingPayoutsOptions = () =>
    queryOptions({
        queryKey: ['jobs', 'pending-payouts'],
        queryFn: () => jobApi.pendingPayouts(),
        select: (res) => {
            return {
                pendingPayouts: parseList(JobSchema, res.result),
            }
        },
    })

export const jobScheduleOptions = (month: number, year: number) =>
    queryOptions({
        queryKey: ['jobs', 'schedule', `${month}/${year}`],
        queryFn: () => jobApi.jobsDueInMonth(month, year),
        select: (res) => parseList(JobSchema, res.result),
    })

// 3. Jobs theo Deadline
export const jobsDueOnDateOptions = (isoDate: string) =>
    queryOptions({
        queryKey: ['jobs', 'due-on', isoDate],
        queryFn: () => jobApi.getJobsDueOnDate(isoDate),
        enabled: !!isoDate,
        select: (res) => {
            return parseList(JobSchema, res.result)
        },
    })

// 7. Job By No (Chi tiết theo mã)
export const jobByNoOptions = (jobNo: string) =>
    queryOptions({
        queryKey: jobQueryKeys.detailByNo(jobNo),
        queryFn: () => jobApi.findByJobNo(jobNo),
        enabled: !!jobNo,
        select: (res) => {
            const jobData = res?.result
            return parseData(JobSchema, jobData)
        },
    })

// 8. Job Assignees
export const jobAssigneesOptions = (jobId: string) =>
    queryOptions({
        queryKey: ['jobs', 'assignees', 'id', jobId],
        queryFn: () => jobApi.getAssignees(jobId),
        enabled: !!jobId,
        select: (res) => ({
            assignees: parseList(UserSchema, res.result?.assignees),
            totalAssignees: res?.result?.totalAssignees ?? 0,
        }),
    })

// 10. Job Detail (Chi tiết theo ID)
export const jobDetailOptions = (id?: string) =>
    queryOptions({
        queryKey: ['jobs', 'id', id],
        queryFn: () => (id ? jobApi.findOne(id) : null),
        enabled: !!id,
        select: (res) => res?.result,
    })

// 11. Activity Logs
export const jobActivityLogsOptions = (jobId: string) =>
    queryOptions({
        queryKey: jobId
            ? ['job-activity-log', 'id', jobId]
            : ['jobActivityLog'],
        queryFn: () => jobApi.getJobActivityLog(jobId),
        select: (res) => {
            const logs = res?.result
            return parseList(JobActivityLogSchema, logs)
        },
    })

export const createJobOptions = mutationOptions({
    mutationFn: (
        data: Omit<
            TCreateJobFormValues,
            | 'useExistingSharepointFolder'
            | 'sharepointTemplateId'
            | 'isCreateSharepointFolder'
        >
    ) => jobApi.create(data),
    onError: (err) => onErrorToast(err, 'Create failed'),
})

export const updateJobStatusOptions = mutationOptions({
    mutationFn: ({
        jobId,
        data,
    }: {
        jobId: string
        data: TChangeStatusInput
    }) => jobApi.changeStatus(jobId, data),
    onError: (err) => onErrorToast(err, 'Update status Failed'),
})

export const bulkUpdateJobStatusOptions = mutationOptions({
    mutationFn: ({ data }: { data: TBulkChangeStatusInput }) =>
        jobApi.bulkChangeStatus(data),
    onError: (err) => onErrorToast(err, 'Bulk update job status failed'),
})

export const rescheduleJobOptions = mutationOptions({
    mutationFn: ({ jobId, data }: { jobId: string; data: TRescheduleJob }) =>
        jobApi.reschedule(jobId, data),
    onError: (err) => onErrorToast(err, 'Reschedule job failed'),
})

export const deliverJobOptions = mutationOptions({
    mutationFn: ({
        jobId,
        data,
    }: {
        jobId: string
        data: Omit<TDeliverJobInput, 'jobId'>
    }) => jobApi.deliverJob(jobId, data),
    onError: (err) => onErrorToast(err, 'Deliver job failed'),
})

export const markJobPaidOptions = mutationOptions({
    mutationFn: (jobId: string) => jobApi.markPaid(jobId),
    onError: (err) => onErrorToast(err, 'Mark job paid failed'),
})

export const cancelJobOptions = mutationOptions({
    mutationFn: (jobId: string) => jobApi.remove(jobId),
    onError: (err) => onErrorToast(err, 'Cancel job failed'),
})

export const assignMemberToJobOptions = mutationOptions({
    mutationFn: ({ jobId, data }: { jobId: string; data: TAssignMember }) =>
        jobApi.assignMember(jobId, data),
    onError: (err) => onErrorToast(err, 'Assign member failed'),
})

export const unassignMemberToJobOptions = mutationOptions({
    mutationFn: ({ jobId, memberId }: { jobId: string; memberId: string }) =>
        jobApi.removeMember(jobId, memberId),
    onError: (err) => onErrorToast(err, 'Remove member failed'),
})

export const updateJobGeneralInfoOptions = mutationOptions({
    mutationFn: ({ jobId, data }: { jobId: string; data: TUpdateJobInput }) =>
        jobApi.updateGeneralInfo(jobId, data),
    onError: (err) => onErrorToast(err, 'Update general information failed'),
})

export const updateAssignmentCostOptions = mutationOptions({
    mutationFn: ({
        jobId,
        memberId,
        staffCost,
    }: {
        jobId: string
        memberId: string
        staffCost: number
    }) => jobApi.updateAssignmentCost(jobId, memberId, staffCost),
    onError: (err) => onErrorToast(err, 'Update assignment cost failed'),
})

export const updateJobOptions = mutationOptions({
    mutationFn: ({ jobId, data }: { jobId: string; data: TUpdateJobInput }) =>
        jobApi.update(jobId, data),
    onError: (err) => onErrorToast(err, 'Update job failed'),
})

export const updateJobRevenueMutationOptions = mutationOptions({
    mutationFn: ({ jobId, data }: { jobId: string; data: TUpdateJobRevenue }) =>
        jobApi.updateRevenue(jobId, data),
    onError: (err) => onErrorToast(err, 'Update revenue failed'),
})

export const updateAttachmentsMutationOptions = mutationOptions({
    mutationFn: (data: {
        jobId: string
        action: 'add' | 'remove'
        files: string[]
    }) => jobApi.updateAttachments(data.jobId, data),
    onError: (err) => onErrorToast(err, 'Update failed'),
})
