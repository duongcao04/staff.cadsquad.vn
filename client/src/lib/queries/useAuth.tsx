import { authApi } from '@/lib/api'
import { cookie } from '@/lib/cookie'
import { COOKIES } from '@/lib/utils'
import {
    UserSchema,
    type TLoginInput,
    type TUpdateProfileInput,
} from '@/lib/validationSchemas'
import type { TUser } from '@/shared/types'
import { addToast } from '@heroui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queryClient } from '../../main'
import { ApiResponse } from '../axios'
import { parseData } from '../zod'
import { onErrorToast } from './helper'
import {
    activeSessionsListOptions,
    profileOptions,
} from './options/user-queries'

function parseExpires(expiresAt: string | number) {
    if (typeof expiresAt === 'number') {
        const ms =
            String(expiresAt).length === 10 ? expiresAt * 1000 : expiresAt
        return new Date(ms)
    }
    return new Date(expiresAt)
}
export const useLogin = () => {
    const mutation = useMutation({
        mutationFn: (data: TLoginInput) => authApi.login(data),
        onSuccess: (res) => {
            // 1. Trích xuất dữ liệu từ body
            const {
                accessToken: { token, expiresAt },
                sessionId, // Backend nên trả về sessionId trong body hoặc trích xuất từ res.headers
            } = res.data.result

            // 2. Set cookie cho Authentication (Token)
            cookie.set(COOKIES.authentication, token, {
                path: '/',
                expires: parseExpires(expiresAt),
                sameSite: 'strict', // Khuyên dùng để tăng bảo mật
            })

            // 3. Set cookie cho Session ID
            // Nếu Backend trả về sessionId trong result body:
            if (sessionId) {
                cookie.set(COOKIES.sessionId, sessionId, {
                    path: '/',
                    expires: parseExpires(expiresAt), // Hết hạn cùng token
                })
            }
            // Hoặc nếu bạn muốn lấy từ Response Header (x-session-id):
            else {
                const headerSessionId = res.headers['x-session-id']
                if (headerSessionId) {
                    cookie.set(COOKIES.sessionId, headerSessionId, {
                        path: '/',
                        expires: parseExpires(expiresAt),
                    })
                }
            }
        },
        onError: (err) => {
            onErrorToast(err, (err as unknown as { error: string }).error)
        },
    })

    return {
        ...mutation,
        accessToken: mutation.data?.data.result.accessToken.token,
    }
}

export const useLogout = () => {
    return useMutation({
        mutationFn: async () => {
            cookie.remove(COOKIES.authentication)

            queryClient.clear?.()
            queryClient.invalidateQueries?.()
            queryClient.removeQueries?.()
        },
    })
}

export const useRevokeSessionMutation = () => {
    return useMutation({
        mutationKey: ['revokeSession'],
        mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
        onSuccess: (res) => {
            addToast({ title: res.message, color: 'success' })
            queryClient.refetchQueries({
                queryKey: profileOptions().queryKey,
            })
            queryClient.refetchQueries({
                queryKey: activeSessionsListOptions().queryKey,
            })
        },
        onError: (err) => onErrorToast(err, 'Revoke session Failed'),
    })
}

export const useRevokeAllSessionMutation = (
    onSuccess?: (res: ApiResponse) => void
) => {
    return useMutation({
        mutationKey: ['revokeAllSession'],
        mutationFn: () => authApi.revokeAllSession(),
        onSuccess: (res) => {
            if (onSuccess) {
                onSuccess(res)
            } else {
                addToast({ title: res.message, color: 'danger' })
            }
            queryClient.refetchQueries({
                queryKey: profileOptions().queryKey,
            })
            queryClient.refetchQueries({
                queryKey: activeSessionsListOptions().queryKey,
            })
        },
        onError: (err) => onErrorToast(err, 'Revoke all session Failed'),
    })
}

export function useProfile() {
    const {
        data,
        status,
        isLoading: isQueryLoading,
    } = useQuery({
        queryKey: ['profile'],
        queryFn: () => authApi.getProfile(),
        select: (res) => res.result,
    })

    const accessToken = cookie.get(COOKIES.authentication)

    const profile = useMemo(() => parseData(UserSchema, data), [data])

    const userRole = profile?.role

    const isAdmin = userRole?.code === 'admin'
    const isStaff = userRole?.code === 'staff'
    const isAccounting = userRole?.code === 'accounting'

    const userPermissions = profile?.role?.permissions?.map(
        (perm) => perm.entityAction as string
    )

    return {
        data: profile,
        profile: profile,
        isLoading: isQueryLoading || (status === 'pending' && !!accessToken),
        isStaff,
        isAdmin,
        isAccounting,
        userRole,
        userPermissions,
    }
}

export function useAuth() {
    const {
        data: profile,
        isLoading: loadingProfile,
        isFetching: fetchingProfile,
    } = useQuery({
        queryKey: ['profile'],
        queryFn: () => authApi.getProfile(),
        select: (res) => res.result,
    })

    const userRole = profile?.role

    return {
        profile,
        loadingProfile: loadingProfile || fetchingProfile,
        userRole,
    }
}

export const useUpdateProfileMutation = (
    onSuccess?: (res: ApiResponse<TUser>) => void
) => {
    return useMutation({
        mutationFn: async (data: TUpdateProfileInput) =>
            await authApi.updateProfile(data),
        onSuccess: (res) => {
            queryClient.refetchQueries({ queryKey: ['profile'] })
            if (onSuccess) {
                onSuccess(res)
            } else {
                addToast({ title: res.message, color: 'danger' })
            }
        },
        onError: (err) => onErrorToast(err, 'Failed to update profile'),
    })
}

export const useForgotPasswordMutation = (
    onSuccess?: (res: ApiResponse) => void
) => {
    return useMutation({
        mutationFn: async (email: string) =>
            await authApi.forgotPassword(email),
        onSuccess: (res) => {
            if (onSuccess) {
                onSuccess(res)
            } else {
                addToast({ title: res.message, color: 'danger' })
            }
        },
        onError: (err) => onErrorToast(err, 'Failed to forgot password'),
    })
}
export const useResetPasswordWithTokenMutation = (
    onSuccess?: (res: ApiResponse) => void
) => {
    return useMutation({
        mutationFn: async (data: { token: string; newPassword: string }) => {
            return authApi.resetPasswordWithToken(data)
        },
        onSuccess: (res) => {
            if (onSuccess) {
                onSuccess(res)
            } else {
                addToast({ title: res.message, color: 'danger' })
            }
        },
        onError: (err) => onErrorToast(err, 'Failed to reset password'),
    })
}
