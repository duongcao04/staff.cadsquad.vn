import { addToast } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '../../main'
import { roleApi } from '../api'
import { onErrorToast } from './helper'
import { TCreateRoleInput } from '../validationSchemas/_role.schema'

export const useCreateRoleMutation = () => {
    return useMutation({
        // Payload truyền vào mutation
        mutationFn: (data: TCreateRoleInput) => roleApi.createRole(data),

        onSuccess: (res) => {
            addToast({
                title: 'Create new role successfully',
                color: 'success',
            })

            // Làm mới danh sách roles và danh sách users để cập nhật UI
            queryClient.refetchQueries({ queryKey: ['roles'] })
        },

        onError: (err: any) =>
            onErrorToast(err, 'Assign member to role failed'),
    })
}

export const useAddMemberToRoleMutation = () => {
    return useMutation({
        // Payload truyền vào mutation
        mutationFn: ({ roleId, userId }: { roleId: string; userId: string }) =>
            roleApi.addMember(roleId, userId),

        onSuccess: (res) => {
            addToast({
                title: 'Thành công',
                description: 'Đã gán vai trò cho người dùng mới.',
                color: 'success',
            })

            // Làm mới danh sách roles và danh sách users để cập nhật UI
            queryClient.refetchQueries({ queryKey: ['roles'] })
            queryClient.refetchQueries({ queryKey: ['users'] })
        },

        onError: (err: any) =>
            onErrorToast(err, 'Assign member to role failed'),
    })
}

export const useRemoveMemberRoleMutation = () => {
    return useMutation({
        // Payload truyền vào mutation
        mutationFn: (userId: string) => roleApi.removeMember(userId),

        onSuccess: (res) => {
            addToast({
                title: 'Remove member successfully',
                color: 'success',
            })

            // Làm mới danh sách roles và danh sách users để cập nhật UI
            queryClient.refetchQueries({ queryKey: ['roles'] })
            queryClient.refetchQueries({ queryKey: ['users'] })
        },

        onError: (err: any) =>
            onErrorToast(err, 'Remove member to role failed'),
    })
}

export const useBulkUpdatePermissions = (roleId: string) => {
    return useMutation({
        mutationFn: (permissionIds: string[]) =>
            roleApi.bulkUpdatePermissions(roleId, permissionIds),

        onSuccess: () => {
            addToast({
                title: 'Cập nhật thành công',
                description: 'Danh sách quyền hạn đã được thay đổi.',
                color: 'success',
            })

            // Refetch dữ liệu của Role cụ thể này và danh sách Roles nói chung
            queryClient.refetchQueries({ queryKey: ['roles', roleId] })
            queryClient.refetchQueries({ queryKey: ['roles'] })
        },

        onError: (err: any) =>
            onErrorToast(err, 'Bulk update permissions failed'),
    })
}
