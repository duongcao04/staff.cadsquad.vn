import { type ApiResponse, axiosClient } from '@/lib/axios'
import {
    TGroupPermission,
    TPermission,
    TRole,
} from '@/shared/types'
import { TCreateRoleInput } from '../validationSchemas/_role.schema'

export const roleApi = {
    createRole: async (data: TCreateRoleInput) => {
        return axiosClient
            .post<
                ApiResponse<{
                    role: TRole
                }>
            >('/v1/roles', data)
            .then((res) => res.data)
    },
    findAll: async () => {
        return axiosClient
            .get<
                ApiResponse<{
                    roles: TRole[]
                    total: number
                }>
            >(`/v1/roles`)
            .then((res) => res.data)
    },
    findOneRole: async (identify: string) => {
        return axiosClient
            .get<ApiResponse<TRole>>(`/v1/roles/${identify}`)
            .then((res) => res.data)
    },
    findAllPermission: async () => {
        return axiosClient
            .get<
                ApiResponse<{
                    permissions: TPermission[]
                    total: number
                }>
            >(`/v1/roles/permissions`)
            .then((res) => res.data)
    },
    findAllPermissionGrouped: async () => {
        return axiosClient
            .get<
                ApiResponse<{ groups: TGroupPermission[] }>
            >(`/v1/roles/permissions/grouped`)
            .then((res) => res.data)
    },

    bulkUpdatePermissions: async (roleId: string, permissionIds: string[]) => {
        return axiosClient
            .patch<ApiResponse<TRole>>(`/v1/roles/${roleId}/permissions/bulk`, {
                permissionIds,
            })
            .then((res) => res.data)
    },

    // Mutate
    addMember: async (roleId: string, userId: string) => {
        return axiosClient
            .post<ApiResponse<any>>(`/v1/roles/${roleId}/members/${userId}`)
            .then((res) => res.data)
    },

    removeMember: async (userId: string) => {
        return axiosClient
            .delete<ApiResponse<any>>(`/v1/roles/members/${userId}`)
            .then((res) => res.data)
    },
}
