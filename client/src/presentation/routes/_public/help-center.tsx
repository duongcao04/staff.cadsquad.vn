import { HelpCenterPage } from '@presentation/features/help-center'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/help-center')({
    head: () => ({
        meta: [
            {
                title: 'Help Center',
            },
        ],
    }),
    component: HelpCenterPage,
})
