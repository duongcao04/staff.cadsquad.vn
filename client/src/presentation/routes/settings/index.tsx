import { SettingsPage } from '@/presentation/features/personalization-settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/')({
    component: SettingsPage,
})
