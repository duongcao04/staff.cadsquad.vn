import { SettingsMorePage } from '@presentation/features/administrator/more'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/administrator/more')({
    component: SettingsMorePage,
})
