import { FileManagerPage } from '@presentation/features/administrator/management/files'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/mgmt/file-docs/')({
    head: () => ({
        meta: [
            {
                title: 'File & Docs Management',
            },
        ],
    }),
    component: FileManagerPage,
})
