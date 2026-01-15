export type PermissionAction = 'INHERIT' | 'GRANT' | 'DENY'

// Helper để xác định trạng thái hiện tại của UI
export const getPermissionStatus = (
    permCode: string,
    rolePerms: string[],
    userOverrides: { permission: { entityAction: string }; isDenied: boolean }[]
): { status: PermissionAction; effective: boolean } => {
    const override = userOverrides.find(
        (o) => o.permission.entityAction === permCode
    )

    // 1. Nếu có Override
    if (override) {
        return {
            status: override.isDenied ? 'DENY' : 'GRANT',
            effective: !override.isDenied,
        }
    }

    // 2. Nếu Inherit từ Role
    const roleHasPerm = rolePerms.includes(permCode)
    return {
        status: 'INHERIT',
        effective: roleHasPerm,
    }
}
