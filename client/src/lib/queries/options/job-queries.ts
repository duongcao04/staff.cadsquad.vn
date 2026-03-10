import { jobApi } from '@/lib/api'
import { JobActivityLogSchema, JobSchema, TJobQueryInput, UserSchema } from '@/lib/validationSchemas'
import { ProjectCenterTabEnum } from '@/shared/enums'
import { queryOptions } from '@tanstack/react-query'
import lodash from 'lodash'
import queryString from 'query-string'
import { parseList } from '../../zod'

// --- Query Options ---
// 1. Danh sách Jobs
export const jobsListOptions = (
    params: TJobQueryInput = {
        hideFinishItems: '0',
        page: 1,
        limit: 10,
        tab: ProjectCenterTabEnum.ACTIVE,
        isAll: '0',
        sort: ['displayName:asc'],
    }
) => {
    const { hideFinishItems, page, limit, search, tab, sort, ...filters } =
        params

    return queryOptions({
        queryKey: [
            'jobs',
            `tab=${tab}`,
            `limit=${limit}`,
            `page=${page}`,
            `keywords=${search}`,
            `isHideFinishItems=${hideFinishItems}`,
            `sort=${sort}`,
            `filters=${queryString.stringify(filters)}`,
        ],
        queryFn: () => {
            const newParams = lodash.omitBy(params, lodash.isUndefined)
            return jobApi.findAll(newParams)
        },
        // ✅ Select & Map data ngay tại đây
        select: (res) => ({
            jobs: parseList(res.result?.data, JobSchema),
            paginate: res.result?.paginate,
        }),
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
                hideFinishItems: '1',
            })
        },
        // ✅ Select & Map data ngay tại đây
        select: (res) => ({
            jobs: parseList(res.result?.data, JobSchema),
            paginate: res.result?.paginate,
        }),
    })
}

// 2. Tìm kiếm Jobs
export const jobsSearchOptions = (keywords?: string) =>
    queryOptions({
        queryKey: ['jobs', 'search', keywords],
        queryFn: () => {
            if (!keywords) return null
            return jobApi.searchJobs(keywords)
        },
        enabled: !!keywords,
        select: (res) =>
            parseList(res?.result, JobSchema),
    })

export const jobDeliveriesListOptions = (jobId: string) =>
    queryOptions({
        queryKey: ['jobs', 'deliveries', jobId],
        queryFn: () => jobApi.jobDeliveries(jobId),
        select: (res) => res?.result ?? [],
    })

export const jobsPendingDeliverOptions = () =>
    queryOptions({
        queryKey: ['jobs', 'pending-deliver'],
        queryFn: () => jobApi.pendingDeliver(),
        select: (res) => parseList(res.result, JobSchema),
    })

export const jobsPendingPayoutsOptions = () =>
    queryOptions({
        queryKey: ['jobs', 'pending-payouts'],
        queryFn: () => jobApi.pendingPayouts(),
        select: (res) => parseList(res.result, JobSchema),
    })
export const jobScheduleOptions = (month: number, year: number) =>
    queryOptions({
        queryKey: ['jobs', 'schedule', `${month}/${year}`],
        queryFn: () => jobApi.jobsDueInMonth(month, year),
        select: (res) => parseList(res.result, JobSchema),
    })

// 3. Jobs theo Deadline
export const jobsDueOnDateOptions = (isoDate: string) =>
    queryOptions({
        queryKey: ['jobs', 'due-on', isoDate],
        queryFn: () => jobApi.getJobsDueOnDate(isoDate),
        enabled: !!isoDate,
        select: (res) => {
            return parseList(res.result, JobSchema)
        },
    })

// 7. Job By No (Chi tiết theo mã)
export const jobByNoOptions = (jobNo: string) =>
    queryOptions({
        queryKey: ['jobs', 'no', jobNo],
        queryFn: () => jobApi.findByJobNo(jobNo),
        enabled: !!jobNo,
        select: (res) => {
            const jobData = res?.result
            return parseList(jobData, JobSchema)
        },
    })

// 8. Job Assignees
export const jobAssigneesOptions = (jobId: string) =>
    queryOptions({
        queryKey: ['jobs', 'assignees', 'id', jobId],
        queryFn: () => jobApi.getAssignees(jobId),
        enabled: !!jobId,
        select: (res) => ({
            assignees: parseList(res.result.assignees, UserSchema),
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
            return parseList(logs, JobActivityLogSchema)
        },
    })
