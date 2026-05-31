import { ProfilePage } from '@presentation/features/user-workspace/profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/profile')({
    head: () => ({
        meta: [
            {
                title: 'Profile',
            },
        ],
    }),
    component: ProfilePage,
})
