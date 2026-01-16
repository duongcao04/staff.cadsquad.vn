import { authApi, userApi } from '@/lib/api'
import { IMAGES, toDate, toNullableDate } from '@/lib/utils'
import { TUserQueryInput } from '@/lib/validationSchemas'
import { IUserResponse } from '@/shared/interfaces'
import { TUser } from '@/shared/types'
import { queryOptions } from '@tanstack/react-query'
import { mapDepartment } from './department-queries'
import { mapJobTitle } from './job-title-queries'
import { mapRole } from './role-queries'

export const mapUser: (item?: IUserResponse) => TUser = (item) => {
    return {
        id: item?.id ?? 'N/A',
        displayName: item?.displayName ?? 'Unknown User',
        avatar: item?.avatar ?? IMAGES.emptyAvatar,
        personalEmail: item?.personalEmail || null,
        email: item?.email ?? 'unknown@cadsquad.vn',
        username: item?.username ?? 'unknown',
        phoneNumber: item?.phoneNumber ?? 'Unknown phone number',
        department: mapDepartment(item?.department ?? undefined) ?? null,
        jobTitle: mapJobTitle(item?.jobTitle ?? undefined) ?? null,
        isActive: Boolean(item?.isActive),
        role: mapRole(item?.role),
        files: item?.files ?? [],
        accounts: item?.accounts ?? [],
        notifications: item?.notifications ?? [],
        configs: item?.configs ?? [],
        securityLogs: item?.securityLogs ?? [],
        filesCreated: item?.filesCreated ?? [],
        jobActivityLog: item?.jobActivityLog ?? [],
        jobsCreated: item?.jobsCreated ?? [],
        sendedNotifications: item?.sendedNotifications ?? [],
        lastLoginAt: toNullableDate(item?.lastLoginAt),
        createdAt: toDate(item?.createdAt),
        updatedAt: toDate(item?.updatedAt),
    }
}

export const usersListOptions = (
    params: TUserQueryInput = {
        sortBy: '',
        sortOrder: 'asc',
    }
) => {
    return queryOptions({
        queryKey: [
            'users',
            `page=${params.page}`,
            `limit=${params.limit}`,
            `sort=${params.sortBy}:${params.sortOrder}`,
            `search=${params.search}`,
        ],
        queryFn: () => userApi.findAll(params),
        select: (res) => {
            const userData = res?.result?.users
            return {
                users: Array.isArray(userData) ? userData.map(mapUser) : [],
                total: res.result?.total ?? 0,
                currentPage: res.result?.currentPage ?? 1,
                totalPages: res.result?.totalPages ?? 1,
            }
        },
    })
}

export const userOptions = (username: string) => {
    return queryOptions({
        queryKey: ['users', 'username', username],
        queryFn: () => userApi.findOne(username),
        select: (res) => {
            const userData = res?.result
            return mapUser(userData)
        },
    })
}
export const profileOptions = () => {
    return queryOptions({
        queryKey: ['profile'],
        queryFn: () => authApi.getProfile(),
        select: (res) => {
            const userData = res?.data.result
            return mapUser(userData)
        },
    })
}
export const securityLogsListOptions = () => {
    return queryOptions({
        queryKey: ['user', 'securityLogs'],
        queryFn: () => userApi.getSecurityLogs(),
        select: (res) => {
            return { securityLogs: res?.data.result }
        },
    })
}
export const activeSessionsListOptions = () => {
    return queryOptions({
        queryKey: ['user', 'activeSessions'],
        queryFn: () => authApi.activeSessions(),
        select: (res) => {
            return { activeSessions: res?.data.result ?? [] }
        },
    })
}
export const checkUsernameTakenOptions = (username: string) => {
    return queryOptions({
        queryKey: ['users', 'username', 'taken', username],
        queryFn: () => userApi.checkUsernameTaken(username),
        select: (res) => {
            return { isTaken: res.result?.isExist }
        },
    })
}
