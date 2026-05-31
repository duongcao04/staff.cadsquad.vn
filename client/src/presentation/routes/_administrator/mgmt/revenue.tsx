import { RevenueReports } from '@presentation/features/administrator/management/revenue'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/mgmt/revenue')({
    component: RevenueReports,
})
