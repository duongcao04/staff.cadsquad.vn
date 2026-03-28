import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/shared/guards/protected-route'
import { APP_PERMISSIONS } from '@staff-cadsquad/shared'

export const Route = createFileRoute('/_administrator/mgmt/access-control')({
    component: () => {
        return (
            <ProtectedRoute permissions={APP_PERMISSIONS.ROLE.MANAGE}>
                <Outlet />
            </ProtectedRoute>
        )
    },
})
