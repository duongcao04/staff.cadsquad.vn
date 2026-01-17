import { JobColumnKey } from '@/shared/types'
import { APP_PERMISSIONS, AppPermission } from './_app-permissions'

export const JOB_COLUMNS: {
    displayName: string
    uid: JobColumnKey
    sortable: boolean
    description?: string
    requiredPermission?: AppPermission // For permission handling
}[] = [
    {
        displayName: 'Thumbnail',
        uid: 'thumbnailUrl',
        sortable: false,
    },
    {
        displayName: 'Client',
        uid: 'clientName',
        sortable: false,
    },
    {
        displayName: 'Job type',
        uid: 'type',
        sortable: true,
    },
    {
        displayName: 'Job no',
        uid: 'no',
        sortable: true,
    },
    {
        displayName: 'Job name',
        uid: 'displayName',
        sortable: true,
    },
    {
        displayName: 'Income',
        uid: 'incomeCost',
        sortable: true,
        requiredPermission: APP_PERMISSIONS.JOB.READ_SENSITIVE as AppPermission,
        description: 'Total revenue (Admin/Accounting only).',
    },
    {
        displayName: 'Total Staff Cost',
        uid: 'totalStaffCost',
        sortable: true,
        requiredPermission: APP_PERMISSIONS.JOB.READ_SENSITIVE as AppPermission,
        description: 'Sum of all staff costs for this job.',
    },
    {
        displayName: 'Staff Cost',
        uid: 'staffCost',
        sortable: false,
        description: 'The specific cost allocated to you for this job.',
    },
    {
        displayName: 'Status',
        uid: 'status',
        sortable: false,
    },
    {
        displayName: 'Due on',
        uid: 'dueAt',
        sortable: true,
    },
    {
        displayName: 'Assignee',
        uid: 'assignments',
        sortable: false,
    },
    {
        displayName: 'Payment',
        uid: 'isPaid',
        sortable: false,
    },
    {
        displayName: 'Actions',
        uid: 'action',
        sortable: false,
    },
] /**
 * Lọc danh sách cột dựa trên quyền (Permissions) và lựa chọn hiển thị (Toggles).
 * @param userPermissions - Mảng các quyền của User hiện tại (AppPermission[])
 * @param visibleColumns - Trạng thái từ store hoặc UI toggle
 */
export const getAllowedJobColumns = (
    visibleColumns: 'all' | JobColumnKey[] = 'all',
    userPermissions: string[]
) => {
    // 1. Lọc dựa trên quyền (Security check)
    const allowedByPermission = JOB_COLUMNS.filter((column) => {
        // Nếu cột không yêu cầu quyền đặc biệt, hiển thị cho mọi người
        if (!column.requiredPermission) return true

        // Nếu User là Super Admin (có quyền system.manage), cho phép xem hết
        if (
            userPermissions?.includes(
                APP_PERMISSIONS.SYSTEM.MANAGE as AppPermission
            )
        )
            return true

        // Kiểm tra xem User có quyền cụ thể cho cột này không
        return userPermissions?.includes(column.requiredPermission)
    })

    // 2. Lọc dựa trên tùy chọn hiển thị của User (UI Toggle)
    if (visibleColumns === 'all') return allowedByPermission

    return allowedByPermission.filter((column) => {
        return visibleColumns?.includes(column.uid)
    })
}
