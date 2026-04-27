export class PrivilegeHelper {
    /**
     * Checks if a user possesses a specific permission, with an optional custom bypass.
     * @param userPermissions - Array of permissions the user currently has.
     * @param requiredPermission - The specific permission to check for.
     * @param bypassWith - Optional custom permission(s) that bypass the required one.
     * @returns True if the user has the exact permission or the bypass permission.
     */
    static hasPermission(
        userPermissions: string[],
        requiredPermission: string,
        bypassWith?: string | string[]
    ): boolean {
        if (!userPermissions || !requiredPermission) {
            return false
        }

        // 1. Check for the exact permission match
        if (userPermissions.includes(requiredPermission)) {
            return true
        }

        // 2. Custom Bypass Logic
        if (bypassWith) {
            // Convert to an array just in case a single string was passed
            const bypasses = Array.isArray(bypassWith)
                ? bypassWith
                : [bypassWith]

            // Return true if the user has AT LEAST ONE of the bypass permissions
            if (bypasses.some((bypass) => userPermissions.includes(bypass))) {
                return true
            }
        }

        return false
    }

    /**
     * Checks if a user possesses ALL of the required permissions.
     * @param userPermissions - Array of permissions the user currently has.
     * @param requiredPermissions - Array of permissions the user needs to have.
     * @param bypassWith - Optional custom permission(s) that bypass the check.
     * @returns True if the user has ALL required permissions or a bypass permission.
     */
    static hasEveryPermission(
        userPermissions: string[],
        requiredPermissions: string[],
        bypassWith?: string | string[]
    ): boolean {
        if (!userPermissions || !requiredPermissions) {
            return false
        }

        if (requiredPermissions.length === 0) {
            return true
        }

        // Pass the bypassWith option down to the base hasPermission method
        return requiredPermissions.every((permission) =>
            this.hasPermission(userPermissions, permission, bypassWith)
        )
    }

    /**
     * Checks if a user possesses AT LEAST ONE of the allowed permissions.
     * @param userPermissions - Array of permissions the user currently has.
     * @param allowedPermissions - Array of permissions to check against.
     * @param bypassWith - Optional custom permission(s) that bypass the check.
     * @returns True if the user has AT LEAST ONE permission or a bypass permission.
     */
    static hasAnyPermission(
        userPermissions: string[],
        allowedPermissions: string[],
        bypassWith?: string | string[]
    ): boolean {
        if (!userPermissions || !allowedPermissions) {
            return false
        }

        // Pass the bypassWith option down to the base hasPermission method
        return allowedPermissions.some((permission) =>
            this.hasPermission(userPermissions, permission, bypassWith)
        )
    }
}
