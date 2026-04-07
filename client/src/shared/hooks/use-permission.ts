import { useCallback } from 'react'
import { AppPermission, useProfile } from '../../lib'

export const usePermission = () => {
    const {
        profile: user,
        isLoading: loadingProfile,
        userPermissions,
    } = useProfile()

    /**
     * Checks if the current user possesses AT LEAST ONE of the specified permissions.
     * * - If the user has the `'admin'` role, this automatically returns `true`.
     * - If no permissions are required (empty array), it returns `true`.
     * - If the user has no assigned role, it returns `false`.
     * * @param requiredPerms - A single permission or an array of permissions to check.
     * @returns `true` if the user has >= 1 of the required permissions (or is admin).
     * * @example
     * // Returns true if the user can either create OR update jobs
     * const canEdit = hasSomePermissions([APP_PERMISSIONS.JOB.CREATE, APP_PERMISSIONS.JOB.UPDATE]);
     */
    const hasSomePermissions = useCallback(
        (requiredPerms: AppPermission | AppPermission[] | string | string[]) => {
            if (user?.role?.code === 'admin') return true
            if (!user?.role) return false

            const required = Array.isArray(requiredPerms) ? requiredPerms : [requiredPerms]
            if (required.length === 0) return true

            return required.some((code) => userPermissions?.includes(code as string))
        },
        [user?.role?.code, userPermissions]
    )

    /**
     * Checks if the current user possesses ALL of the specified permissions.
     * * - If the user has the `'admin'` role, this automatically returns `true`.
     * - If no permissions are required (empty array), it returns `true`.
     * - If the user has no assigned role, it returns `false`.
     * * @param requiredPerms - A single permission or an array of permissions to check.
     * @returns `true` if the user has EVERY required permission (or is admin).
     * * @example
     * // Returns true ONLY if the user has BOTH read and write access to clients
     * const canManageClient = hasEveryPermissions([APP_PERMISSIONS.CLIENT.READ, APP_PERMISSIONS.CLIENT.WRITE]);
     */
    const hasEveryPermissions = useCallback(
        (requiredPerms: AppPermission | AppPermission[] | string | string[]) => {
            if (user?.role?.code === 'admin') return true
            if (!user?.role) return false

            const required = Array.isArray(requiredPerms) ? requiredPerms : [requiredPerms]
            if (required.length === 0) return true

            return required.every((code) => userPermissions.includes(code as string))
        },
        [user?.role?.code, userPermissions]
    )

    return {
        user,
        userPermissions,
        loadingProfile,
        hasSomePermissions,
        hasEveryPermissions,
        hasPermission: hasSomePermissions,
    }
}