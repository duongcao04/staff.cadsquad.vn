import { NotificationList } from '@/features/notifications'
import { getPageTitle, notificationsInfiniteOptions } from '@/lib'
import { PageHeading } from '@/shared/components'
import { Button, Spinner } from '@heroui/react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense, useEffect, useMemo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useInView } from 'react-intersection-observer'

export const Route = createFileRoute('/_workspace/notifications/')({
    head: () => ({ meta: [{ title: getPageTitle('Notifications') }] }),
    loader: ({ context }) => {
        // Prefetch the first page
        void context.queryClient.ensureInfiniteQueryData(
            notificationsInfiniteOptions()
        )
    },
    component: NotificationsPage,
})

function NotificationsPage() {
    return (
        <>
            <PageHeading
                title="Notifications"
                classNames={{
                    wrapper: 'pl-6 pr-3.5 py-4 border-b border-border-default',
                }}
            />
            <div className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-80px)]">
                <ErrorBoundary
                    fallback={
                        <div className="p-10 text-center text-danger">
                            <p>Failed to load notifications</p>
                            <Button onPress={() => window.location.reload()}>
                                Retry
                            </Button>
                        </div>
                    }
                >
                    <Suspense fallback={<NotificationsSkeleton />}>
                        <NotificationsContainer />
                    </Suspense>
                </ErrorBoundary>
            </div>
        </>
    )
}

function NotificationsContainer() {
    // --- 2. Use Infinite Query ---
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useSuspenseInfiniteQuery(notificationsInfiniteOptions())

    // --- 3. Flatten Data ---
    const allNotifications = useMemo(
        () => data.pages.flatMap((page) => page.notifications),
        [data]
    )

    // --- 4. Infinite Scroll Trigger (Sentinel) ---
    const Sentinel = () => {
        const { ref, inView } = useInView({
            threshold: 0.5,
            rootMargin: '100px',
        })

        useEffect(() => {
            if (inView && hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        }, [inView, hasNextPage, isFetchingNextPage])

        if (!hasNextPage) return <div className="h-4" /> // Spacer

        return (
            <div ref={ref} className="w-full flex justify-center py-6">
                <Spinner size="sm" color="default" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <NotificationList data={allNotifications} isLoading={false} />

            <Sentinel />
        </div>
    )
}

function NotificationsSkeleton() {
    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full pt-10">
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="w-full h-24 rounded-xl bg-content2 animate-pulse"
                />
            ))}
        </div>
    )
}
