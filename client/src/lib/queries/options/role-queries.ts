import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { roleApi } from '../../api'
import { RoleSchema, TCreateRoleInput } from '../../validationSchemas'
import { parseData, parseList } from '../../zod'
import { onErrorToast } from '../helper'

// 1. Keys Factory
export const roleQueryKeys = {
    resource: ['roles'] as const,
    lists: () => [...roleQueryKeys.resource, 'lists'] as const,
    detail: (id: string) => [...roleQueryKeys.resource, 'identify', id] as const,
}

// 2. Fetch Options
export const rolesListOptions = () => {
    return queryOptions({
        queryKey: roleQueryKeys.lists(),
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
        queryKey: roleQueryKeys.detail(identify),
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

// 3. Mutation Options
export const createRoleOptions = mutationOptions({
    mutationFn: (data: TCreateRoleInput) => roleApi.createRole(data),
    onError: (err: any) =>
        onErrorToast(err, 'Assign member to role failed'),
})

export const assignMemberRoleOptions = mutationOptions({
    mutationFn: ({ roleId, userId }: { roleId: string; userId: string }) =>
        roleApi.addMember(roleId, userId),
    onError: (err: any) =>
        onErrorToast(err, 'Assign member to role failed'),
})

export const removeMemberRoleOptions = mutationOptions({
    mutationFn: (userId: string) => roleApi.removeMember(userId),
    onError: (err: any) =>
        onErrorToast(err, 'Remove member to role failed'),
})