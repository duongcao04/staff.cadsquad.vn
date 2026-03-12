import { RevenueChart, TopPerformers, TopStats } from '@/features/analysis'
import { CreateJobModal } from '@/features/job-manage'
import { getPageTitle, useProfile } from '@/lib'
import { analyticsOverviewOptions } from '@/lib/queries'
import { AdminPageHeading } from '@/shared/components'
import { Button, useDisclosure } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/admin/')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Admin Dashboard'),
            },
        ],
    }),
    loader: ({ context }) => {
        return context.queryClient.ensureQueryData(analyticsOverviewOptions({}))
    },
    component: AdminDashboardPage,
})

function AdminDashboardPage() {
    const { profile } = useProfile()

    const {
        data: {
            cards: { activeJobs, overdue, pendingReview, waitingPayment },
            financialChart: { data: financialChart },
            topPerformers,
        },
    } = useSuspenseQuery(analyticsOverviewOptions({}))

    const createJobModalDisclosure = useDisclosure({
        id: 'CreateJobModal',
    })

    return (
        <>
            {createJobModalDisclosure.isOpen && (
                <CreateJobModal
                    isOpen={createJobModalDisclosure.isOpen}
                    onClose={createJobModalDisclosure.onClose}
                />
            )}
            <AdminPageHeading
                classNames={{
                    base: 'grid grid-cols-[300px_1fr_300px]',
                }}
                title={
                    <>
                        <h1 className="text-xl font-medium text-text-default">
                            Welcome Back, {profile?.displayName} 👋
                        </h1>
                        <p className="text-text-subdued text-sm mt-1">
                            Your Team's Success Starts Here. Let's Make Progress
                            Together!
                        </p>
                    </>
                }
                actions={
                    <div className="flex items-center bg-background-hovered rounded-xl border border-border-default p-1 shadow-sm">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => createJobModalDisclosure.onOpen}
                        >
                            Add Job
                        </Button>
                    </div>
                }
            />
            <div className="flex-1">
                {/* Heading */}

                {/* Content Flow */}
                <div className="space-y-5">
                    <TopStats
                        activeJobs={activeJobs}
                        overdueJobs={overdue}
                        pendingReview={pendingReview}
                        waitingPayment={waitingPayment}
                    />
                    <RevenueChart data={financialChart} />
                    <TopPerformers data={topPerformers} />
                </div>
            </div>
        </>
    )
}
