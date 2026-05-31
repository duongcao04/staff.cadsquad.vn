import { AppLoading } from '@presentation/components'
import { WorkspaceLayout } from '@presentation/features/user-workspace'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace')({
    pendingComponent: AppLoading,
    component: WorkspaceLayout,
})
