import { SecuritySettingsPage } from '@presentation/features/personalization-settings/security'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/login-and-security')({
    head: () => ({
        meta: [
            {
                title: 'Login & Security',
            },
        ],
    }),
    component: SecuritySettingsPage,
})
