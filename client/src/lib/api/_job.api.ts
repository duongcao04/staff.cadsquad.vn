import { type ApiResponse, axiosClient } from '@/lib/axios'
import {
    TAssignMember,
    type TBulkChangeStatusInput,
    type TChangeStatusInput,
    TCreateCommentInput,
    type TCreateJobFormValues,
    TDeliverJobInput,
    type TJobQueryInput,
    type TRescheduleJob,
    type TUpdateJobInput,
    TUpdateJobRevenue,
} from '@/lib/validationSchemas'
import { ProjectCenterTabEnum } from '@/shared/enums'
import type {
    IPaginate,
} from '@/shared/interfaces'
import type {
    JobColumnKey,
    JobUpdateResponse,
    TJobComment,
} from '@/shared/types'
import lodash from 'lodash'
import queryString from 'query-string'

export const jobApi = {
    // =========================================================================
    // CORE CRUD (Create, Read, Update, Delete)
    // =========================================================================
    create: async (data: Omit<
        TCreateJobFormValues,
        | 'useExistingSharepointFolder'
        | 'sharepointTemplateId'
        | 'isCreateSharepointFolder'
    >) => {
        return axiosClient
            .post<ApiResponse<any>>('/v1/jobs', {
                ...data,
                startedAt: new Date(data.startedAt).toISOString(),
                dueAt: new Date(data.dueAt).toISOString(),
                incomeCost: data.incomeCost.toString(),
                totalStaffCost: data.totalStaffCost.toString(),
                jobAssignments: data.jobAssignments?.map((item) => ({
                    ...item,
                    staffCost: item.staffCost.toString(),
                })),
            })
            .then((res) => res.data)
    },

    findAll: async (query: TJobQueryInput) => {
        const queryStringFormatter = queryString.stringify(query, {
            arrayFormat: 'comma',
        })
        return axiosClient
            .get<
                ApiResponse<{ data: any[]; paginate: IPaginate }>
            >(`/v1/jobs?${queryStringFormatter}`)
            .then((res) => res.data)
    },

    findOne: async (id: string) => {
        return axiosClient
            .get<ApiResponse<any>>(`/v1/jobs/${id}`)
            .then((res) => res.data)
    },

    findByJobNo: async (jobNo: string) => {
        return axiosClient
            .get<ApiResponse<any>>(`/v1/jobs/no/${jobNo}`)
            .then((res) => res.data)
    },

    update: async (id: string, data: TUpdateJobInput) => {
        return axiosClient
            .patch<ApiResponse<JobUpdateResponse>>(`/v1/jobs/${id}`, {
                ...data,
                incomeCost: data.incomeCost?.toString(),
            })
            .then((res) => res.data)
    },

    remove: async (jobId: string) => {
        return axiosClient
            .delete<
                ApiResponse<{ id: string; message: string }>
            >(`/v1/jobs/${jobId}`)
            .then((res) => res.data)
    },

    // =========================================================================
    // WORKFLOW & STATUS (Status, Delivery, Payouts)
    // =========================================================================
    changeStatus: async (id: string, data: TChangeStatusInput) => {
        return axiosClient
            .patch<
                ApiResponse<{ id: string; no: string }>
            >(`/v1/jobs/${id}/change-status`, data)
            .then((res) => res.data)
    },

    bulkChangeStatus: async (data: TBulkChangeStatusInput) => {
        return axiosClient
            .post<ApiResponse<any>>(`/v1/jobs/bulk/change-status`, data)
            .then((res) => res.data)
    },

    reschedule: async (id: string, data: TRescheduleJob) => {
        return axiosClient
            .patch<
                ApiResponse<{ id: string; no: string }>
            >(`/v1/jobs/${id}/reschedule`, data)
            .then((res) => res.data)
    },

    togglePin: async (jobId: string) => {
        return axiosClient
            .post<
                ApiResponse<{ isPinned: boolean; message: string }>
            >(`/v1/jobs/${jobId}/toggle-pin`)
            .then((res) => res.data)
    },

    markPaid: async (jobId: string) => {
        return axiosClient
            .post<
                ApiResponse<{ id: string; no: string }>
            >(`/v1/jobs/${jobId}/mark-paid`)
            .then((res) => res.data)
    },

    deliverJob: async (
        jobId: string,
        data: Omit<TDeliverJobInput, 'jobId'>
    ) => {
        return axiosClient
            .post<ApiResponse<any>>(`/v1/jobs/${jobId}/deliver`, data)
            .then((res) => res.data)
    },

    adminDeliverJobAction: async (
        deliveryId: string,
        action: 'approve' | 'reject',
        feedback?: string
    ) => {
        return axiosClient
            .post<ApiResponse<any>>(
                `/v1/jobs/deliver/${deliveryId}/${action}`,
                {
                    feedback,
                }
            )
            .then((res) => res.data)
    },

    jobDeliveries: async (jobId: string) => {
        return axiosClient
            .get<ApiResponse<any[]>>(`/v1/jobs/${jobId}/deliveries`)
            .then((res) => res.data)
    },

    // =========================================================================
    // ASSIGNMENTS & MEMBERS
    // =========================================================================
    getAssignees: async (id: string) => {
        return axiosClient
            .get<
                ApiResponse<{
                    assignees: any[]
                    totalAssignees: number
                }>
            >(`/v1/jobs/${id}/assignees`)
            .then((res) => res.data)
    },

    assignMember: async (jobId: string, data: TAssignMember) => {
        return axiosClient
            .patch<
                ApiResponse<JobUpdateResponse>
            >(`/v1/jobs/${jobId}/assign`, data)
            .then((res) => res.data)
    },

    removeMember: async (jobId: string, memberId: string) => {
        return axiosClient
            .delete<
                ApiResponse<JobUpdateResponse>
            >(`/v1/jobs/${jobId}/assignments/${memberId}`)
            .then((res) => res.data)
    },

    updateAssignmentCost: async (
        jobId: string,
        memberId: string,
        staffCost: number
    ) => {
        return axiosClient
            .patch<
                ApiResponse<JobUpdateResponse>
            >(`/v1/jobs/${jobId}/assignments/${memberId}`, { staffCost })
            .then((res) => res.data)
    },

    // =========================================================================
    // DETAILS UPDATES (General, Attachments, Revenue)
    // =========================================================================
    updateGeneralInfo: async (
        jobId: string,
        data: Partial<TUpdateJobInput>
    ) => {
        return axiosClient
            .patch<ApiResponse<JobUpdateResponse>>(
                `/v1/jobs/${jobId}/general`,
                {
                    clientId: data.clientId,
                    displayName: data.displayName,
                    description: data.description,
                    dueAt: !lodash.isEmpty(data.dueAt)
                        ? new Date(data.dueAt!).toISOString()
                        : undefined,
                    startedAt: !lodash.isEmpty(data.startedAt)
                        ? new Date(data.startedAt!).toISOString()
                        : undefined,
                }
            )
            .then((res) => res.data)
    },

    updateRevenue: async (id: string, data: TUpdateJobRevenue) => {
        return axiosClient
            .patch<
                ApiResponse<JobUpdateResponse>
            >(`/v1/jobs/${id}/update-revenue`, { ...data, incomeCost: data.incomeCost?.toString() })
            .then((res) => res.data)
    },

    updateAttachments: async (
        jobId: string,
        data: { action: 'add' | 'remove'; files: string[] }
    ) => {
        return axiosClient
            .patch<
                ApiResponse<JobUpdateResponse>
            >(`/v1/jobs/${jobId}/attachments`, data)
            .then((res) => res.data)
    },

    // =========================================================================
    // SPECIALIZED QUERIES & DASHBOARD
    // =========================================================================
    workbenchData: async (query: TJobQueryInput) => {
        const queryStringFormatter = queryString.stringify(query, {
            arrayFormat: 'comma',
        })
        return axiosClient
            .get<
                ApiResponse<{ data: any[]; paginate: IPaginate }>
            >(`/v1/jobs/workbench?${queryStringFormatter}`)
            .then((res) => res.data)
    },

    searchJobs: async (keywords: string) => {
        return axiosClient
            .get<ApiResponse<any[]>>('/v1/jobs/search', {
                params: { keywords },
            })
            .then((res) => res.data)
    },

    countTab: async (tab: ProjectCenterTabEnum) => {
        return axiosClient
            .get<ApiResponse<number>>(`/v1/jobs/count`, { params: { tab } })
            .then((res) => res.data)
    },

    pendingDeliver: async () => {
        return axiosClient
            .get<ApiResponse<any[]>>(`/v1/jobs/pending-deliver`)
            .then((res) => res.data)
    },

    pendingPayouts: async () => {
        return axiosClient
            .get<ApiResponse<any[]>>(`/v1/jobs/pending-payouts`)
            .then((res) => res.data)
    },

    jobsDueInMonth: async (month: number, year: number) => {
        return axiosClient
            .get<
                ApiResponse<any[]>
            >(`/v1/jobs/due-monthly?month=${month}&year=${year}`)
            .then((res) => res.data)
    },

    getJobsDueOnDate: async (isoDate: string) => {
        return axiosClient
            .get<ApiResponse<any[]>>(`/v1/jobs/due-at/${isoDate}`)
            .then((res) => res.data)
    },

    getJobActivityLog: async (id: string) => {
        // You might want to type the response here if you have TJobActivityLog
        return axiosClient
            .get<
                ApiResponse<any[]>
            >(`/v1/jobs/${id}/activity-logs`)
            .then((res) => res.data)
    },

    // =========================================================================
    // UTILS & CONFIG
    // =========================================================================
    getNextNo: async (typeId: string) => {
        return axiosClient
            .get<ApiResponse<string>>('/v1/jobs/next-no', {
                params: { typeId },
            })
            .then((res) => res.data)
    },

    columns: async () => {
        return axiosClient
            .get<ApiResponse<JobColumnKey[]>>('/v1/jobs/columns')
            .then((res) => res.data)
    },

    // =========================================================================
    // COMMENTS
    // =========================================================================
    createComment: async (jobId: string, data: TCreateCommentInput) => {
        return axiosClient
            .post<
                ApiResponse<{ id: string; no: string }>
            >(`/v1/jobs/${jobId}/comments`, data)
            .then((res) => res.data)
    },

    getComments: async (jobId: string) => {
        return axiosClient
            .get<ApiResponse<TJobComment[]>>(`/v1/jobs/${jobId}/comments`)
            .then((res) => res.data)
    },
}
