import { AppearanceSettingsPage } from '@presentation/features/personalization-settings/appearance'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/appearance')({
    head: () => ({
        meta: [
            {
                title: 'Appearance Settings',
            },
        ],
    }),
    component: AppearanceSettingsPage,
})
