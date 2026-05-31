import { profileOptions } from '@/presentation/lib/queries/options/user-queries'
import { createFileRoute } from '@tanstack/react-router'
import { ProfileSettingsPage } from '../../features/personalization-settings/my-profile'

export const Route = createFileRoute('/settings/my-profile')({
    head: () => ({
        meta: [
            {
                title: 'Profile Settings',
            },
        ],
    }),
    loader: ({ context }) => {
        return context.queryClient.ensureQueryData(profileOptions())
    },
    component: ProfileSettingsPage,
})
