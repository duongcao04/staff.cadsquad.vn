import { queryOptions } from '@tanstack/react-query'
import { roleApi } from '../../api'
import { PermissionSchema, RoleSchema } from '../../validationSchemas'
import { parseData, parseList } from '../../zod'

export const rolesListOptions = () => {
    return queryOptions({
        queryKey: ['roles'],
        queryFn: () => roleApi.findAll(),
        select: (res) => {
            const rolesData = res?.result?.roles
            return {
                roles: parseList(RoleSchema, rolesData),
                total: res.result?.total ?? 0,
            }
        },
    })
}

export const roleOptions = (identify: string) => {
    return queryOptions({
        queryKey: ['roles', 'identify', identify],
        queryFn: () => roleApi.findOneRole(identify),
        select: (res) => {
            const role = parseData(RoleSchema, res.result)
            const permissions = role.permissions.map((it) => it.entityAction)
            return {
                role,
                permissions,
            }
        },
    })
}

export const permissionGroupsListOptions = () => {
    return queryOptions({
        queryKey: ['group-permissions'],
        queryFn: () => roleApi.findAllPermissionGrouped(),
        select: (res) => {
            return Array.isArray(res.result?.groups) ? res.result?.groups : []
        },
    })
}

export const permissionsListOptions = () => {
    return queryOptions({
        queryKey: ['permissions'],
        queryFn: () => roleApi.findAllPermission(),
        select: (res) => {
            const permissionData = res?.result?.permissions
            return {
                permissions: parseList(PermissionSchema, permissionData),
                total: res.result?.total ?? 0,
            }
        },
    })
}
