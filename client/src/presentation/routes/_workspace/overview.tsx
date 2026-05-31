import { OverviewPage } from '@presentation/features/user-workspace/overview'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/overview')({
    head: () => ({
        meta: [{ title: 'Workspace Overview' }],
    }),
    component: OverviewPage,
})
