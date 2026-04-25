import { authApi, userApi } from '@/lib/api'
import {
    TResetPasswordInput,
    TUpdatePasswordInput,
    TUpdateUserInput,
    TUserQueryInput,
    UserSchema,
} from '@/lib/validationSchemas'
import { mutationOptions, queryOptions } from '@tanstack/react-query'
import z from 'zod'
import { TCreateUserInput } from '../../../features/staff-directory'
import { parseData, parseList } from '../../zod'
import { onErrorToast } from '../helper'

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
            `department=${params.departmentId}`,
        ],
        queryFn: async () => {
            const res = await userApi.findAll(params)
            const result = res?.result

            // Parse danh sách user bằng helper
            return {
                users: parseList(UserSchema, result?.users),
                total: result?.total ?? 0,
                currentPage: result?.currentPage ?? 1,
                totalPages: result?.totalPages ?? 1,
            }
        },
        // Lúc này data trong select đã là data đã parse
        select: (data) => data,
    })
}
export const userOptions = (code: string) => {
    return queryOptions({
        queryKey: ['users', 'code', code],
        queryFn: async () => {
            const res = await userApi.findByStaffCode(code)
            return parseData(UserSchema, res?.result)
        },
    })
}

export const profileOptions = () => {
    return queryOptions({
        queryKey: ['profile'],
        queryFn: async () => await authApi.getProfile(),
        select(res) {
            return { profile: parseData(UserSchema, res?.result) }
        },
    })
}

export const securityLogsListOptions = () => {
    return queryOptions({
        queryKey: ['user', 'securityLogs'],
        queryFn: async () => {
            const res = await userApi.getSecurityLogs()
            // Nếu SecurityLogs có Schema riêng, hãy thay z.any() bằng Schema đó
            return {
                securityLogs: parseList(z.any(), res?.result),
            }
        },
    })
}

export const activeSessionsListOptions = () => {
    return queryOptions({
        queryKey: ['user', 'activeSessions'],
        queryFn: async () => {
            const res = await authApi.activeSessions()
            return {
                activeSessions: parseList(z.any(), res?.result),
            }
        },
    })
}

export const checkUsernameTakenOptions = (username: string) => {
    return queryOptions({
        queryKey: ['users', 'username', 'taken', username],
        queryFn: async () => {
            const res = await userApi.checkUsernameTaken(username)
            return { isTaken: Boolean(res.result?.isExist) }
        },
    })
}

// 3. Mutation Options
export const updateUserOptions = mutationOptions({
    mutationFn: ({
        username,
        data,
    }: {
        username: string
        data: TUpdateUserInput
    }) => {
        return userApi.update(username, data)
    },
    onError: (err: any) => onErrorToast(err, 'Update failed'),
})

export const updateUsePasswordOptions = mutationOptions({
    mutationFn: ({
        updatePasswordInput,
    }: {
        updatePasswordInput: TUpdatePasswordInput
    }) => {
        return userApi.updatePassword(updatePasswordInput)
    },
    onError: (error) => onErrorToast(error, 'Update password failed'),
})

export const resetPasswordOptions = mutationOptions({
    mutationKey: ['resetPassword'],
    mutationFn: ({
        userId,
        resetPasswordInput,
    }: {
        userId: string
        resetPasswordInput: TResetPasswordInput
    }) => {
        return userApi.resetPassword(userId, resetPasswordInput)
    },
    onError: (error) => onErrorToast(error, 'Reset password failed'),
})

export const createUserOptions = mutationOptions({
    mutationFn: async (data: TCreateUserInput) => {
        const userCreated = await userApi.create(data, data.sendInviteEmail)
        return parseData(UserSchema, userCreated.result)
    },
    onError: (error) => onErrorToast(error, 'Create user failed'),
})

export const deleteUserOptions = mutationOptions({
    mutationFn: async (id: string) => await userApi.remove(id),
    onError: (error) => onErrorToast(error, 'Delete user failed'),
})

export const restoreUserOptions = mutationOptions({
    mutationFn: async (id: string) => await userApi.restore(id),
    onError: (error) => onErrorToast(error, 'Restore user failed'),
})

export const toggleUserStatusOptions = mutationOptions({
    mutationFn: async ({
        userId,
        forceStatus,
    }: {
        userId: string
        forceStatus?: boolean
    }) => await userApi.toggleStatus(userId, forceStatus),
    onError: (err) => onErrorToast(err, 'Failed to toggle user status'),
})
