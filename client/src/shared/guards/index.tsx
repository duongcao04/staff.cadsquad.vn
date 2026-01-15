import React from 'react'
import { APP_PERMISSIONS } from '../../lib/utils/_app-permissions'
import ProtectedRoute from './protected-route'

/**
 * 1. Basic Auth Guard
 * Cho phép MỌI người dùng đã đăng nhập truy cập.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>
}

/**
 * 2. System Admin Guard
 * Chỉ dành cho những người có quyền quản lý hệ thống (System Manage).
 */
export function AdministratorGuard({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute permissions={[APP_PERMISSIONS.SYSTEM.MANAGE]}>
            {children}
        </ProtectedRoute>
    )
}

/**
 * 3. Finance/Accounting Guard
 * Dành cho những người có quyền liên quan đến thanh toán hoặc tài chính.
 * Thường bao gồm Kế toán và Admin.
 */
export function FinanceGuard({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute
            permissions={[
                APP_PERMISSIONS.PAYMENT_CHANNEL.READ,
                APP_PERMISSIONS.JOB.PAID,
            ]}
        >
            {children}
        </ProtectedRoute>
    )
}

/**
 * 4. Staff/Recruitment Guard
 * Dành cho nhân viên vận hành, quản lý Jobs.
 * Chỉ cần có quyền Tạo hoặc Cập nhật Job là có thể vào.
 */
export function RecruitmentGuard({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute
            permissions={[
                APP_PERMISSIONS.JOB.CREATE,
                APP_PERMISSIONS.JOB.UPDATE,
            ]}
        >
            {children}
        </ProtectedRoute>
    )
}
