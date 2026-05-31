import { AppLoading } from '@presentation/components'
import { ClientManagementPage } from '@presentation/features/administrator/management/client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/mgmt/clients/')({
    head: () => ({ meta: [{ title: 'Client Management' }] }),
    pendingComponent: AppLoading,
    component: ClientManagementPage,
})
