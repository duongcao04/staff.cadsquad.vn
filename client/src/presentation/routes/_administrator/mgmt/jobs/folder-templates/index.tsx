import { AppLoading } from '@presentation/components'
import { FolderTemplatesPage } from '@presentation/features/administrator/management/folder-template'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_administrator/mgmt/jobs/folder-templates/'
)({
    pendingComponent: AppLoading,
    component: FolderTemplatesPage,
})
