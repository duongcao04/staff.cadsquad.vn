import { createFileRoute } from '@tanstack/react-router'
import { NotificationSettingsPage } from '../../features/personalization-settings/notifications'

export const Route = createFileRoute('/settings/notifications')({
    head: () => ({
        meta: [
            {
                title: 'Notification Settings',
            },
        ],
    }),
    component: NotificationSettingsPage,
})
