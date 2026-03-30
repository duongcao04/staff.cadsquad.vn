import {
    AdminActivityLogs,
    AdminBusinessIntelligence,
    AdminDatabaseStats,
    AdminKpiCards,
} from '@/features/admin-dashboard'
import { CreateJobModal } from '@/features/job-manage'
import { auditLogsListOptions, INTERNAL_URLS } from '@/lib'
import {
    adminDashboardDbStatsOptions,
    adminDashboardKpisOptions,
    adminDashboardOvewviewOptions,
} from '@/lib/queries/options/administrator-queries'
import { AdminPageHeading, AppLoading, HeroButton } from '@/shared/components'
import { ErrorPageContent } from '@/shared/components/admin'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { useDisclosure } from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Settings } from 'lucide-react'

export const Route = createFileRoute('/_administrator/admin/')({
    head: () => ({
        meta: [
            {
                title: 'Admin Control Center',
            },
        ],
    }),
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(adminDashboardKpisOptions())
        context.queryClient.ensureQueryData(adminDashboardDbStatsOptions())
        context.queryClient.ensureQueryData(adminDashboardOvewviewOptions())
    },
    errorComponent: ({ error, reset }) => (
        <AdminDashboardLayout>
            <ErrorPageContent error={error} refresh={reset} />
        </AdminDashboardLayout>
    ),
    pendingComponent: AppLoading,
    component: () => {
        return (
            <AdminDashboardLayout>
                <AdminDashboardContent />
            </AdminDashboardLayout>
        )
    },
})

function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const createJobModalState = useDisclosure()
    return (
        <>
            <CreateJobModal
                isOpen={createJobModalState.isOpen}
                onClose={createJobModalState.onClose}
            />
            <AdminPageHeading
                title="Admin Control Center"
                description="System overview, business intelligence, operations, and quick administrative actions."
                actions={
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to={INTERNAL_URLS.admin.settings}
                            className="block"
                        >
                            <HeroButton
                                variant="flat"
                                color="default"
                                startContent={<Settings size={16} />}
                            >
                                Settings
                            </HeroButton>
                        </Link>
                        <HeroButton
                            color="primary"
                            startContent={<Plus size={16} />}
                            onPress={createJobModalState.onOpen}
                        >
                            Create Job
                        </HeroButton>
                    </div>
                }
            />
            <AdminContentContainer className="space-y-6">
                {children}
            </AdminContentContainer>
        </>
    )
}

function AdminDashboardContent() {
    const [
        { data: dbStats },
        { data: dbKpis },
        { data: dbOverview },
        {
            data: { logs },
        },
    ] = useSuspenseQueries({
        queries: [
            adminDashboardDbStatsOptions(),
            adminDashboardKpisOptions(),
            adminDashboardOvewviewOptions(),
            auditLogsListOptions(),
        ],
    })
    return (
        <>
            {/* Pass raw dbStats down */}
            <AdminKpiCards
                stats={{
                    jobActives: dbStats.jobs.actives,
                    pendingPayouts: dbStats.jobs.pendingPayouts,
                    pendingReviews: dbStats.jobs.pendingReviews,
                    systemHealthIndex: 100,
                    totalClients: dbStats.clients.total,
                }}
            />

            {/* Pass processed arrays down */}
            <AdminBusinessIntelligence
                topClients={dbKpis?.kpis.topClients || []}
                urgentJobs={dbKpis?.kpis.urgentJobs || []}
                countByStatus={dbStats.jobs.countByStatus || []}
            />

            <AdminActivityLogs auditLogs={logs} />

            <AdminDatabaseStats {...dbOverview} />
        </>
    )
}
