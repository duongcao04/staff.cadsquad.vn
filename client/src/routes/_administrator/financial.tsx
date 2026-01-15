import { createFileRoute, Outlet } from '@tanstack/react-router'

import { FinanceGuard } from '../../shared/guards'

export const Route = createFileRoute('/_administrator/financial')({
    component: FinancialLayout,
})

function FinancialLayout() {
    return (
        <FinanceGuard>
            <Outlet />
        </FinanceGuard>
    )
}
