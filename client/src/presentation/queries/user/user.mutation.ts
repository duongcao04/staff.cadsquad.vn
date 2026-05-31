import { mutationOptions } from '@tanstack/react-query'
import { TCreateUserInput } from '../../features/staff-directory'
import {
    userApi,
    onErrorToast,
    TUpdateUserInput,
    TUpdatePasswordInput,
    TResetPasswordInput,
    parseData,
    UserSchema,
} from '../../lib'

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
