import { TPermission, TRole } from '@/shared/types/_role.type'
import { queryOptions } from '@tanstack/react-query'
import { EntityEnum } from '../../../shared/enums/_entity.enum'
import { roleApi } from '../../api'
import { COLORS } from '../../utils'

export const mapRole: (item?: Partial<TRole>) => TRole = (item) => {
    return {
        id: item?.id ?? 'N/A',
        displayName: item?.displayName ?? 'Unknown role',
        permissions: item?.permissions ?? [],
        users: item?.users ?? [],
        code: item?.code ?? 'UNKNOWN',
        hexColor: item?.hexColor ?? COLORS.white,
    }
}

export const mapPermission: (item?: Partial<TPermission>) => TPermission = (
    item
) => {
    return {
        id: item?.id ?? 'N/A',
        displayName: item?.displayName ?? 'Unknown role',
        action: item?.action ?? '',
        entity: item?.entity ?? ('' as EntityEnum.JOB_TITLE),
        entityAction: item?.entity ?? '',
        roles: item?.roles ?? [],
        description: item?.description ?? '',
        code: item?.code ?? 'UNKNOWN',
    }
}

export const rolesListOptions = () => {
    return queryOptions({
        queryKey: ['roles'],
        queryFn: () => roleApi.findAll(),
        select: (res) => {
            const rolesData = res?.result?.roles
            return {
                roles: Array.isArray(rolesData) ? rolesData.map(mapRole) : [],
                total: res.result?.total ?? 0,
            }
        },
    })
}

export const roleOptions = (identify: string) => {
    return queryOptions({
        queryKey: ['roles', identify],
        queryFn: () => roleApi.findOneRole(identify),
        select: (res) => {
            const role = mapRole(res?.result)
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
                permissions: Array.isArray(permissionData)
                    ? permissionData.map(mapPermission)
                    : [],
                total: res.result?.total ?? 0,
            }
        },
    })
}
