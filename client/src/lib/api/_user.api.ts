import { TCreateUserInput } from '@/features/staff-directory'
import { type ApiResponse, axiosClient } from '@/lib/axios'
import type {
    TResetPasswordInput,
    TUpdatePasswordInput,
    TUpdateUserInput,
    TUserQueryInput,
} from '@/lib/validationSchemas'
import type { IJobResponse, IUserResponse } from '@/shared/interfaces'
import { TRole, TUserSecurityLog } from '@/shared/types'
import lodash from 'lodash'
import queryString from 'query-string'

export interface IProfileOverview {
    stats: {
        totalEarnings: number
        jobsCompleted: number
        hoursLogged: number
        activeJobs: number
    }
    charts: {
        financialChart: string
        jobStatus: string
    }
}
export const userApi = {
    create: async (
        data: Omit<TCreateUserInput, 'sendInviteEmail'>,
        sendInviteEmail: boolean
    ) => {
        return axiosClient
            .post<ApiResponse<IUserResponse>>(
                `/v1/users?sendInviteEmail=${sendInviteEmail ? '1' : '0'}`,
                {
                    displayName: data.displayName,
                    email: data.email,
                    roleId: !lodash.isEmpty(data.roleId)
                        ? data.roleId
                        : undefined,
                    password: data.password,
                    jobTitleId: !lodash.isEmpty(data.jobTitleId)
                        ? data.jobTitleId
                        : undefined,
                    departmentId: !lodash.isEmpty(data.departmentId)
                        ? data.departmentId
                        : undefined,
                }
            )
            .then((res) => res.data)
    },
    search: async (keywords: string) => {
        return axiosClient
            .get<ApiResponse<IUserResponse[]>>(`/v1/users/search?q=${keywords}`)
            .then((res) => res.data)
    },
    findAll: async (params: TUserQueryInput) => {
        const queryStringFormatter = queryString.stringify(params, {
            arrayFormat: 'comma',
        })
        return axiosClient
            .get<
                ApiResponse<{
                    users: IUserResponse[]
                    total: number
                    currentPage: number
                    totalPages: number
                }>
            >(`/v1/users?${queryStringFormatter}`)
            .then((res) => res.data)
    },
    overview: async () => {
        return axiosClient
            .get<
                ApiResponse<IProfileOverview>
            >('/v1/analytics/profile-overview')
            .then((res) => res.data)
    },
    getSecurityLogs: () => {
        return axiosClient.get<ApiResponse<TUserSecurityLog[]>>(
            '/v1/users/security-logs'
        )
    },
    toggleStatus: async (userId: string, forceStatus?: boolean) => {
        const url = forceStatus
            ? `/v1/users/${userId}/status/?isActive=${forceStatus ? '1' : '0'}`
            : `/v1/users/${userId}/status`
        return axiosClient
            .patch<ApiResponse<{ isActive: boolean; username: string }>>(url)
            .then((res) => res.data)
    },
    checkUsernameTaken: async (username: string) => {
        return axiosClient
            .get<
                ApiResponse<{ isExist: boolean }>
            >(`/v1/users/check-username?username=${username}`)
            .then((res) => res.data)
    },
    updatePassword: async (data: TUpdatePasswordInput) => {
        return axiosClient
            .patch<
                ApiResponse<{ username: string }>
            >('/v1/users/update-password', data)
            .then((res) => res.data)
    },
    resetPassword: (userId: string, data: TResetPasswordInput) => {
        return axiosClient.patch<ApiResponse<{ username: string }>>(
            `/v1/users/${userId}/reset-password`,
            data
        )
    },
    findOne: async (username: string) => {
        return axiosClient
            .get<ApiResponse<IUserResponse>>(`/v1/users/${username}`)
            .then((res) => res.data)
    },
    schedule: async (year: number, month: number, day?: number) => {
        let q
        if (day) {
            q = `year=${year}&month=${month}&day=${day}`
        } else {
            q = `year=${year}&month=${month}`
        }

        return axiosClient
            .get<
                ApiResponse<{ jobsSchedule: IJobResponse[] }>
            >(`/v1/users/schedule?${q}`)
            .then((res) => res.data)
    },
    update: async (username: string, data: TUpdateUserInput) => {
        return axiosClient
            .patch<
                ApiResponse<{ id: string; username: string }>
            >(`/v1/users/${username}`, data)
            .then((res) => res.data)
    },
    assignRole: async (userId: string, roleId: string) => {
        return axiosClient
            .patch<
                ApiResponse<{ role: TRole; username: string }>
            >(`/v1/users/${userId}/assign-role`, { roleId })
            .then((res) => res.data)
    },
    remove: (id: string) => {
        return axiosClient.delete<ApiResponse<{ username: string }>>(
            `/v1/users/${id}`
        )
    },
}
