import { mutationOptions, queryOptions } from "@tanstack/react-query"
import { roleApi } from "../../api"
import { PermissionSchema } from "../../validationSchemas"
import { parseList } from "../../zod"
import { onErrorToast } from "../helper"

// 1. Keys Factory
export const permissionQueryKeys = {
	resource: ['permissions'] as const,
	groupList: () => [...permissionQueryKeys.resource, 'group', 'list'] as const,
	lists: () => [...permissionQueryKeys.resource, 'lists'] as const,
	detail: (id: string) => [...permissionQueryKeys.resource, 'identify', id] as const,
}

// 2. Fetch Options
export const permissionGroupsListOptions = () => {
	return queryOptions({
		queryKey: permissionQueryKeys.groupList(),
		queryFn: () => roleApi.findAllPermissionGrouped(),
		select: (res) => {
			return Array.isArray(res.result?.groups) ? res.result?.groups : []
		},
	})
}

export const permissionsListOptions = () => {
	return queryOptions({
		queryKey: permissionQueryKeys.lists(),
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

export const bulkUpdatePermissionOptions = mutationOptions({
	mutationFn: ({ roleId, permissionIds }: { roleId: string, permissionIds: string[] }) =>
		roleApi.bulkUpdatePermissions(roleId, permissionIds),
	onError: (err: any) =>
		onErrorToast(err, 'Bulk update permissions failed'),
})