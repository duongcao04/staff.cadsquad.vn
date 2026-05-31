import { notificationsInfiniteOptions } from '@/presentation/lib'
import { NotificationsPage } from '@presentation/features/user-workspace/notifications'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/notifications')({
    head: () => ({ meta: [{ title: 'Notifications' }] }),
    loader: ({ context }) => {
        // Prefetch the first page
        void context.queryClient.ensureInfiniteQueryData(
            notificationsInfiniteOptions()
        )
    },
    component: NotificationsPage,
})
