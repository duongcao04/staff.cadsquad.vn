import { FolderTemplateDetailPage } from '@presentation/features/administrator/management/folder-template/detail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_administrator/mgmt/jobs/folder-templates/$id'
)({
    component: FolderTemplateDetailPage,
})
