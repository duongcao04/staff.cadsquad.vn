import { TCreateUserInput } from '@/features/staff-directory'
import { userApi } from '@/lib/api'
import { type ApiError, ApiResponse } from '@/lib/axios'
import { queryClient } from '@/main'
import { TRole, TUser } from '@/shared/types'
import { addToast } from '@heroui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import type {
    TResetPasswordInput,
    TUpdatePasswordInput,
    TUpdateUserInput,
} from '../validationSchemas'
import { onErrorToast } from './helper'
import {
    mapUser,
    profileOptions,
    usersListOptions,
} from './options/user-queries'

export const useUsers = () => {
    // Gọi Options
    const options = usersListOptions()

    const { data, refetch, error, isFetching, isLoading } = useQuery(options)

    // Data đã được map sẵn trong options.select
    return {
        refetch,
        isLoading: isLoading || isFetching,
        error,
        data: data?.users ?? [],
    }
}

export const useUpdateUserMutation = (
    onSuccess?: (res: ApiResponse<{ id: string; username: string }>) => void
) => {
    return useMutation({
        mutationKey: ['updateUser'],
        mutationFn: ({
            username,
            data,
        }: {
            username: string
            data: TUpdateUserInput
        }) => {
            return userApi.update(username, data)
        },
        onSuccess: (res) => {
            if (onSuccess) {
                onSuccess?.(res)
            } else {
                addToast({
                    title: 'Update user successfully',
                    color: 'success',
                })
            }
        },
    })
}

export const useUserAssignRoleMutation = (
    onSuccess?: (res: ApiResponse<{ role: TRole; username: string }>) => void
) => {
    return useMutation({
        mutationKey: ['updateUser', 'assignRole'],
        mutationFn: ({
            userId,
            roleId,
        }: {
            userId: string
            roleId: string
        }) => {
            return userApi.assignRole(userId, roleId)
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({
                queryKey: ['users', 'username', res.result?.username],
            })
            if (onSuccess) {
                onSuccess?.(res)
            } else {
                addToast({
                    title:
                        res.message ??
                        `Assign user to ${res.result?.role.displayName} successfully`,
                    color: 'success',
                })
            }
        },
    })
}

export const useUpdateAvatarMutation = (
    onSuccess?: (res: ApiResponse<{ id: string; username: string }>) => void
) => {
    return useMutation({
        mutationKey: ['updateUser', 'avatar'],
        mutationFn: ({
            username,
            avatarUrl,
        }: {
            username: string
            avatarUrl: string
        }) => {
            return userApi.update(username, {
                avatar: avatarUrl,
            })
        },
        onSuccess: async (res) => {
            const { username } = res.result!
            if (onSuccess) {
                onSuccess?.(res)
            } else {
                addToast({
                    title: 'Upload avatar successfully',
                    color: 'success',
                })
            }
            if (username) {
                await queryClient.invalidateQueries({
                    queryKey: profileOptions().queryKey,
                })
            }
        },
    })
}

export const useUpdatePasswordMutation = (
    onSuccess?: (res: ApiResponse<{ username: string }>) => void
) => {
    return useMutation({
        mutationKey: ['updatePassword'],
        mutationFn: ({
            updatePasswordInput,
        }: {
            updatePasswordInput: TUpdatePasswordInput
        }) => {
            return userApi.updatePassword(updatePasswordInput)
        },
        onSuccess: async (res) => {
            await queryClient.invalidateQueries({
                queryKey: ['profile'],
            })
            if (onSuccess) {
                onSuccess(res)
            } else {
                addToast({
                    title: 'Update password successfully',
                    color: 'success',
                })
            }
        },
        onError: (error) => onErrorToast(error, 'Update password failed'),
    })
}

export const useResetPasswordMutation = () => {
    return useMutation({
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
        onSuccess: (res) => {
            addToast({
                title: 'Reset password successfully',
                description: res.data.message,
                color: 'success',
            })

            queryClient.invalidateQueries({
                queryKey: ['profile'],
            })
        },
        onError: (error) => {
            const err = error as unknown as ApiError
            addToast({
                title: 'Reset password failed',
                description: err.message,
                color: 'danger',
            })
        },
    })
}

export const useCreateUserMutation = (onSuccess?: (res: TUser) => void) => {
    return useMutation({
        mutationFn: async (data: TCreateUserInput) => {
            const userCreated = await userApi.create(
                {
                    displayName: data.displayName,
                    email: data.email,
                    roleId: data.roleId,
                    departmentId: data.departmentId,
                    jobTitleId: data.jobTitleId,
                    password: data.password,
                },
                data.sendInviteEmail
            )
            return mapUser(userCreated.result)
        },

        onSuccess: (res) => {
            if (onSuccess) {
                onSuccess(res)
            } else {
                addToast({ title: 'Staff member created', color: 'success' })
            }
            queryClient.refetchQueries({ queryKey: ['users'] })
        },
        onError: (error) => onErrorToast(error, 'User creation failed'),
    })
}

// Mutation: Xóa user
export const useDeleteUserMutation = () => {
    return useMutation({
        mutationFn: async (id: string) => await userApi.remove(id),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['users'] })
        },
        onError: (error) => onErrorToast(error, 'Delete user failed'),
    })
}
export const useToggleUserStatusMutation = (
    onSuccess?: (
        res: ApiResponse<{ isActive: boolean; username: string }>
    ) => void
) => {
    return useMutation({
        mutationFn: async ({
            userId,
            forceStatus,
        }: {
            userId: string
            forceStatus?: boolean
        }) => await userApi.toggleStatus(userId, forceStatus),
        onSuccess: (res) => {
            queryClient.refetchQueries({ queryKey: ['users'] })
            if (onSuccess) {
                onSuccess(res)
            } else {
                addToast({
                    title: res.result?.isActive
                        ? 'Reactive'
                        : 'Inactive' + ' user successfully',
                    color: 'success',
                })
            }
        },
        onError: (err) => onErrorToast(err, 'Failed to toggle user status'),
    })
}
