import { TCreateUserInput } from '@/features/staff-directory'
import { type ApiResponse, axiosClient } from '@/lib/axios'
import type {
    TResetPasswordInput,
    TUpdatePasswordInput,
    TUpdateUserInput,
    TUserQueryInput,
} from '@/lib/validationSchemas'
import { TRole, TUserSecurityLog } from '@/shared/types'
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
            .post<
                ApiResponse<any>
            >(`/v1/users?sendInviteEmail=${sendInviteEmail ? '1' : '0'}`, data)
            .then((res) => res.data)
    },
    search: async (keywords: string) => {
        return axiosClient
            .get<ApiResponse<any[]>>(`/v1/users/search?q=${keywords}`)
            .then((res) => res.data)
    },
    findAll: async (params: TUserQueryInput) => {
        const queryStringFormatter = queryString.stringify(params, {
            arrayFormat: 'comma',
        })
        return axiosClient
            .get<
                ApiResponse<{
                    users: any[]
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
    getSecurityLogs: async () => {
        return axiosClient
            .get<ApiResponse<TUserSecurityLog[]>>('/v1/users/security-logs')
            .then((res) => res.data)
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
    findOne: async (code: string) => {
        return axiosClient
            .get<ApiResponse<any>>(`/v1/users/${code}`)
            .then((res) => res.data)
    },
    findByStaffCode: async (code: string) => {
        return axiosClient
            .get<ApiResponse<any>>(`/v1/users/${code}`)
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
                ApiResponse<{ jobsSchedule: any[] }>
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
    restore: (id: string) => {
        return axiosClient.patch<ApiResponse<{ username: string }>>(
            `/v1/users/${id}/restore`
        )
    },
}
