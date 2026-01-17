import { addToast } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { jobApi } from '@/lib/api'
import {
    TAssignMember,
    type TBulkChangeStatusInput,
    type TChangeStatusInput,
    type TCreateJobInput,
    TDeliverJobInput,
    type TJobQueryInput,
    type TRescheduleJob,
    type TUpdateJobInput,
    TUpdateJobRevenue,
} from '@/lib/validationSchemas'
import { ProjectCenterTabEnum } from '@/shared/enums'
import { TJobGeneralDetails } from '../../routes/_administrator/admin/mgmt/jobs/$no'
import { JobUpdateResponse } from '../../shared/types'
import type { ApiResponse } from '../axios'
import { onErrorToast } from './helper'
import {
    countJobByTabOptions,
    jobAssigneesOptions,
    jobByNoOptions,
    jobDetailOptions,
    jobsDueOnDateOptions,
    jobsListOptions,
    jobsSearchOptions,
    workbenchDataOptions,
} from './options/job-queries'

// =============================================================================
// QUERIES (Read Operations)
// =============================================================================

export const useJobs = (
    params: TJobQueryInput = {
        hideFinishItems: '0',
        page: 1,
        limit: 10,
        tab: ProjectCenterTabEnum.ACTIVE,
    }
) => {
    const options = jobsListOptions(params)
    const { data, refetch, error, isFetching, isLoading } = useQuery(options)

    return {
        refetch,
        isLoading: isLoading || isFetching,
        error,
        jobs: data?.jobs ?? [],
        data: data?.jobs ?? [],
        paginate: data?.paginate,
    }
}

export const useSearchJobs = (keywords?: string) => {
    const { data, isFetching, isLoading } = useQuery(
        jobsSearchOptions(keywords)
    )
    return {
        isLoading: isLoading || isFetching,
        jobs: data,
    }
}

export const useJobsDueOnDate = (isoDate: string) => {
    const { data, isFetching, isLoading } = useQuery(
        jobsDueOnDateOptions(isoDate)
    )
    return {
        data,
        isLoading: isLoading || isFetching,
    }
}

export const useCountJobByTab = (tab: ProjectCenterTabEnum) => {
    const { data, refetch, error, isFetching, isLoading } = useQuery(
        countJobByTabOptions(tab)
    )
    return {
        refetch,
        isLoading: isLoading || isFetching,
        error,
        data,
    }
}

export const useJobByNo = (jobNo: string) => {
    const { data, refetch, error, isLoading } = useQuery(jobByNoOptions(jobNo))
    return {
        refetch,
        data,
        job: data,
        error,
        isLoading,
    }
}

export const useJobAssignees = (jobId: string) => {
    const { data, refetch, error, isLoading } = useQuery(
        jobAssigneesOptions(jobId)
    )
    return {
        refetch,
        data: data?.assignees ?? [],
        totalAssignees: data?.totalAssignees ?? 0,
        error,
        isLoading,
    }
}

export const useJobDetail = (id?: string) => {
    const { data, refetch, error, isLoading } = useQuery(jobDetailOptions(id))
    return {
        refetch,
        job: data,
        error,
        isLoading,
    }
}

// =============================================================================
// MUTATIONS (Write Operations)
// =============================================================================

export const useCreateJobMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['createJob'],
        mutationFn: (data: TCreateJobInput) => jobApi.create(data),
        onSuccess: (res) => {
            addToast({ title: res.message, color: 'success' })
            queryClient.invalidateQueries({
                queryKey: jobsListOptions().queryKey,
            })
            queryClient.invalidateQueries({ queryKey: ['jobTypes'] })
        },
        onError: (err) => onErrorToast(err, 'Create Job Failed'),
    })
}

// --- WORKFLOW MUTATIONS ---

export const useChangeStatusMutation = (
    onSuccess?: (res: ApiResponse<JobUpdateResponse>) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['changeStatus', 'job'],
        mutationFn: ({
            jobId,
            data,
        }: {
            jobId: string
            data: TChangeStatusInput
        }) => jobApi.changeStatus(jobId, data),
        onSuccess: (res) => {
            // Invalidate Lists
            queryClient.invalidateQueries({
                queryKey: jobsListOptions().queryKey,
            })

            // Invalidate Details
            if (res.result?.no) {
                queryClient.invalidateQueries({
                    queryKey: jobByNoOptions(res.result.no).queryKey,
                })
            }
            if (res.result?.id) {
                // Invalidate Logs
                queryClient.invalidateQueries({
                    queryKey: ['jobActivityLog', String(res.result.id)],
                })
                // Invalidate ID based fetch
                queryClient.invalidateQueries({
                    queryKey: jobDetailOptions(res.result.id).queryKey,
                })
            }

            if (onSuccess) onSuccess(res)
            else addToast({ title: res.message, color: 'success' })
        },
        onError: (err) => onErrorToast(err, 'Change Status Failed'),
    })
}

export const useBulkChangeStatusMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['changeStatus', 'job', 'bulk'],
        mutationFn: ({ data }: { data: TBulkChangeStatusInput }) =>
            jobApi.bulkChangeStatus(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
            addToast({
                title: 'Bulk status update successful',
                description: res.message,
                color: 'success',
            })
        },
        onError: (err) => onErrorToast(err, 'Bulk update failed'),
    })
}

export const useRescheduleMutation = (
    onSuccess?: (res: ApiResponse<JobUpdateResponse>) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['reschedule', 'job'],
        mutationFn: ({
            jobId,
            data,
        }: {
            jobId?: string
            data: TRescheduleJob
        }) => {
            if (!jobId) throw new Error('Job ID missing')
            return jobApi.reschedule(jobId, data)
        },
        onSuccess: (res) => {
            if (onSuccess) onSuccess(res)
            else addToast({ title: res.message, color: 'success' })

            queryClient.invalidateQueries({ queryKey: ['jobs'] })
            if (res.result?.no) {
                queryClient.invalidateQueries({
                    queryKey: jobByNoOptions(res.result.no).queryKey,
                })
            }
            if (res.result?.id) {
                queryClient.invalidateQueries({
                    queryKey: ['jobActivityLog', String(res.result.id)],
                })
            }
        },
        onError: (err) => onErrorToast(err, 'Reschedule Failed'),
    })
}

export const useDeliverJobMutation = (
    onSuccess?: (res: ApiResponse) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['deliver', 'job'],
        mutationFn: ({
            jobId,
            data,
        }: {
            jobId: string
            data: Omit<TDeliverJobInput, 'jobId'>
        }) => jobApi.deliverJob(jobId, data),
        onSuccess: (res) => {
            if (onSuccess) onSuccess(res)
            else addToast({ title: res.message, color: 'success' })
            queryClient.refetchQueries({ queryKey: ['jobs'] })
        },
        onError: (err) => onErrorToast(err, 'Deliver Job Failed'),
    })
}

export const useAdminDeliverJobMutation = (
    onSuccess?: (res: ApiResponse) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['deliver', 'job', 'admin'],
        mutationFn: ({
            deliveryId,
            action,
            feedback,
        }: {
            deliveryId: string
            action: 'approve' | 'reject'
            feedback?: string
        }) => jobApi.adminDeliverJobAction(deliveryId, action, feedback),
        onSuccess: (res) => {
            if (onSuccess) onSuccess(res)
            else addToast({ title: res.message, color: 'success' })
            queryClient.refetchQueries({ queryKey: ['jobs'] })
        },
        onError: (err) => onErrorToast(err, 'Action Failed'),
    })
}

export const useMarkPaidMutation = (
    onSuccess?: (res: ApiResponse<{ id: string; no: string }>) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['markPaid', 'job'],
        mutationFn: (jobId: string) => jobApi.markPaid(jobId),
        onSuccess: (res) => {
            if (onSuccess) onSuccess(res)
            else
                addToast({
                    title: `Paid job #${res.result?.no}`,
                    color: 'success',
                })
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
        },
        onError: (err) => onErrorToast(err, 'Mark as paid failed'),
    })
}

// --- UTILS MUTATIONS ---

export const useTogglePinJobMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['togglePin', 'job'],
        mutationFn: (jobId: string) => jobApi.togglePin(jobId),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
            addToast({
                title: res.result?.isPinned ? 'Job pinned' : 'Job unpinned',
                description: res.result?.message,
                color: 'success',
            })
        },
        onError: (err) => onErrorToast(err, 'Pin job failed'),
    })
}

export const useDeleteJobMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['deleteJob'],
        mutationFn: (jobId: string) => jobApi.remove(jobId),
        onSuccess: (res) => {
            addToast({
                title: 'Deleted successfully',
                description: res.message,
                color: 'success',
            })
            queryClient.refetchQueries({ queryKey: ['jobs'] })
        },
        onError: (err) => onErrorToast(err, 'Delete job failed'),
    })
}

// --- UPDATE & MEMBER MUTATIONS ---

export const useAssignMemberMutation = (
    onSuccess?: (res: ApiResponse<JobUpdateResponse>) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['updateJob', 'assignMember'],
        mutationFn: ({ jobId, data }: { jobId: string; data: TAssignMember }) =>
            jobApi.assignMember(jobId, data),
        onSuccess: (res) => {
            // Smart Invalidation
            queryClient.refetchQueries({ queryKey: jobsListOptions().queryKey })
            queryClient.refetchQueries({
                queryKey: workbenchDataOptions({}).queryKey,
            })

            if (res.result?.no) {
                queryClient.refetchQueries({
                    queryKey: jobByNoOptions(res.result.no).queryKey,
                })
            }
            if (res.result?.id) {
                queryClient.refetchQueries({
                    queryKey: ['jobActivityLog', String(res.result.id)],
                })
                queryClient.refetchQueries({
                    queryKey: jobAssigneesOptions(res.result.id).queryKey,
                })
            }

            if (onSuccess) onSuccess(res)
            else addToast({ title: 'Member assigned', color: 'success' })
        },
        onError: (err) => onErrorToast(err, 'Failed to assign member'),
    })
}

export const useUpdateJobGeneralInfoMutation = (
    onSuccess?: (res: ApiResponse<JobUpdateResponse>) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['updateJob', 'generalInfo'],
        mutationFn: ({
            jobId,
            data,
        }: {
            jobId: string
            data: Partial<TJobGeneralDetails>
        }) => jobApi.updateGeneralInfo(jobId, data),
        onSuccess: (res) => {
            queryClient.refetchQueries({ queryKey: jobsListOptions().queryKey })

            if (res.result?.no) {
                queryClient.refetchQueries({
                    queryKey: jobByNoOptions(res.result.no).queryKey,
                })
            }
            if (res.result?.id) {
                queryClient.refetchQueries({
                    queryKey: ['jobActivityLog', String(res.result.id)],
                })
            }

            if (onSuccess) onSuccess(res)
            else addToast({ title: 'Info updated', color: 'success' })
        },
        onError: (err) => onErrorToast(err, 'Update failed'),
    })
}

export const useUpdateAssignmentCostMutation = (
    onSuccess?: (res: ApiResponse<JobUpdateResponse>) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['updateJob', 'assignmentCost'],
        mutationFn: ({
            jobId,
            memberId,
            staffCost,
        }: {
            jobId: string
            memberId: string
            staffCost: number
        }) => jobApi.updateAssignmentCost(jobId, memberId, staffCost),
        onSuccess: (res) => {
            queryClient.refetchQueries({ queryKey: jobsListOptions().queryKey })

            if (res.result?.no) {
                queryClient.refetchQueries({
                    queryKey: jobByNoOptions(res.result.no).queryKey,
                })
            }
            if (res.result?.id) {
                queryClient.refetchQueries({
                    queryKey: ['jobActivityLog', String(res.result.id)],
                })
                // Important: refetch assignees so cost updates in UI
                queryClient.refetchQueries({
                    queryKey: jobAssigneesOptions(res.result.id).queryKey,
                })
            }

            if (onSuccess) onSuccess(res)
            else addToast({ title: 'Cost updated', color: 'success' })
        },
        onError: (err) => onErrorToast(err, 'Update cost failed'),
    })
}

export const useRemoveMemberMutation = (
    onSuccess?: (res: ApiResponse<JobUpdateResponse>) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['updateJob', 'removeMember'],
        mutationFn: ({
            jobId,
            memberId,
        }: {
            jobId: string
            memberId: string
        }) => jobApi.removeMember(jobId, memberId),
        onSuccess: (res) => {
            queryClient.refetchQueries({ queryKey: ['jobs'] })

            if (res.result?.no) {
                queryClient.refetchQueries({
                    queryKey: jobByNoOptions(res.result.no).queryKey,
                })
            }
            if (res.result?.id) {
                queryClient.refetchQueries({
                    queryKey: ['jobActivityLog', String(res.result.id)],
                })
                queryClient.refetchQueries({
                    queryKey: jobAssigneesOptions(res.result.id).queryKey,
                })
            }

            if (onSuccess) onSuccess(res)
            else addToast({ title: 'Member removed', color: 'success' })
        },
        onError: (err) => onErrorToast(err, 'Remove member failed'),
    })
}

export const useUpdateJobMutation = (
    onSuccess?: (res: ApiResponse<JobUpdateResponse>) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['updateJob'],
        mutationFn: ({
            jobId,
            data,
        }: {
            jobId: string
            data: TUpdateJobInput
        }) => jobApi.update(jobId, data),
        onSuccess: (res) => {
            if (onSuccess) onSuccess(res)
            else addToast({ title: 'Updated successfully', color: 'success' })

            if (res.result?.no) {
                queryClient.invalidateQueries({
                    queryKey: jobByNoOptions(res.result.no).queryKey,
                })
            }
            if (res.result?.id) {
                queryClient.invalidateQueries({
                    queryKey: jobDetailOptions(res.result.id).queryKey,
                })
                queryClient.invalidateQueries({
                    queryKey: ['jobActivityLog', String(res.result.id)],
                })
            }
        },
        onError: (err) => onErrorToast(err, 'Update failed'),
    })
}

export const useUpdateJobRevenueMutation = (
    onSuccess?: (res: ApiResponse<JobUpdateResponse>) => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['updateJob', 'revenue'],
        mutationFn: ({
            jobId,
            data,
        }: {
            jobId: string
            data: TUpdateJobRevenue
        }) => jobApi.updateRevenue(jobId, data),
        onSuccess: (res) => {
            if (onSuccess) onSuccess(res)
            else addToast({ title: 'Revenue updated', color: 'success' })

            if (res.result?.no) {
                queryClient.invalidateQueries({
                    queryKey: jobByNoOptions(res.result.no).queryKey,
                })
            }
            if (res.result?.id) {
                queryClient.invalidateQueries({
                    queryKey: ['jobActivityLog', String(res.result.id)],
                })
            }
        },
        onError: (err) => onErrorToast(err, 'Revenue update failed'),
    })
}

export const useUpdateAttachmentsMutation = (
    jobId: string,
    onSuccess?: () => void
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['updateJob', 'attachments', jobId],
        mutationFn: (data: { action: 'add' | 'remove'; files: string[] }) =>
            jobApi.updateAttachments(jobId, data),
        onSuccess: (res) => {
            addToast({ title: 'Files updated', color: 'success' })

            if (res.result?.no) {
                // Invalidate detailed views
                queryClient.invalidateQueries({
                    queryKey: jobByNoOptions(res.result?.no).queryKey,
                })
            }
            queryClient.invalidateQueries({
                queryKey: ['jobActivityLog', jobId],
            })

            if (onSuccess) onSuccess()
        },
        onError: (err) => onErrorToast(err, 'Failed to update attachments'),
    })
}
