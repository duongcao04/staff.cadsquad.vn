import {
    CreateJobModal,
    getDateRangeOptions,
    getDueInPresets,
    JobManagementStats,
    JobManagementStatsSkeleton,
    JobManagementTable,
} from '@/features/job-manage'
import { adminJobStatsOptions, jobsListOptions } from '@/lib/queries'
import {
    AdminPageHeading,
    AppLoading,
    ErrorPageContent,
    HeroButton,
} from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { TJob } from '@/shared/types'
import {
    Button,
    Card,
    CardBody,
    Divider,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Selection,
    Spinner,
    useDisclosure
} from '@heroui/react'
import { APP_PERMISSIONS } from '@staff-cadsquad/shared'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
    AlertCircle,
    CheckCircle2,
    Download,
    PlusIcon,
    Trash2,
    X,
} from 'lucide-react'
import { Suspense, useMemo, useState } from 'react'
import { z } from 'zod'
import { ProtectedRoute } from '../../../../shared/guards/protected-route'

const DEFAULT_SORT = 'displayName:asc'
export const manageJobsParamsSchema = z.object({
    sort: z.string().optional().catch(DEFAULT_SORT),
    search: z.string().trim().optional(),
    status: z.string().optional(),
    dateRange: z.string().optional().catch('this_year'), // Added dateRange
    limit: z.coerce.number().int().min(1).max(100).optional().catch(10),
    page: z.coerce.number().int().min(1).optional().catch(1),
    dueIn: z.string().optional(),
})
export type TManageJobsParams = z.infer<typeof manageJobsParamsSchema>

export const Route = createFileRoute('/_administrator/mgmt/jobs/')({
    head: () => ({
        meta: [{ title: 'Job Management' }],
    }),
    validateSearch: (search) => manageJobsParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context, deps }) => {
        const {
            limit = 10,
            page = 1,
            search,
            status,
            sort = DEFAULT_SORT,
            dateRange = 'this_year',
        } = deps.search

        const dateRangeOptions = getDateRangeOptions()
        const dateRangeOption = dateRangeOptions.find(
            (it) => dateRange === it.key
        )

        context.queryClient.prefetchQuery(
            jobsListOptions({
                limit,
                page,
                search,
                status,
                sort: [sort],
            })
        )
        context.queryClient.prefetchQuery(
            adminJobStatsOptions({
                from: dateRangeOption?.from?.toISOString(),
                to: dateRangeOption?.to?.toISOString(),
            })
        )
    },
    pendingComponent: AppLoading,
    errorComponent: ({ error, reset }) => {
        return (
            <ManageJobLayout>
                <ErrorPageContent error={error} refresh={reset} />
            </ManageJobLayout>
        )
    },
    component: () => {
        return (
            <ProtectedRoute permissions={[APP_PERMISSIONS.JOB.MANAGE]}>
                <ManageJobLayout>
                    <Suspense fallback={<JobManagementStatsSkeleton />}>
                        <JobManagementStats />
                    </Suspense>
                    <Suspense fallback={<ManageJobsPageSkeleton />}>
                        <ManageJobsPage />
                    </Suspense>
                </ManageJobLayout>
            </ProtectedRoute>
        )
    },
})

function ManageJobLayout({
    badgeCount,
    children,
}: {
    badgeCount?: number
    children: React.ReactNode
}) {
    const createJobModalState = useDisclosure({ id: 'CreateJobModal' })
    return (
        <>
            {createJobModalState.isOpen && (
                <CreateJobModal
                    isOpen={createJobModalState.isOpen}
                    onClose={createJobModalState.onClose}
                />
            )}

            <AdminPageHeading
                title="All Jobs"
                showBadge
                badgeCount={badgeCount}
                actions={
                    <HeroButton
                        color="primary"
                        className="px-6"
                        startContent={<PlusIcon size={16} />}
                        onPress={createJobModalState.onOpen}
                    >
                        New Job
                    </HeroButton>
                }
            />

            <AdminContentContainer className="relative space-y-6">
                {children}
            </AdminContentContainer>
        </>
    )
}
function ManageJobsPageSkeleton() {
    return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-divider bg-content1/50">
            <Spinner size="lg" color="primary" label="Syncing projects..." />
        </div>
    )
}

function ManageJobsPage() {
    const searchParams = Route.useSearch()

    const { dateRange, ...params } = searchParams

    const dueInPresets = getDueInPresets()
    const dueInRange = useMemo(
        () => dueInPresets.find((it) => it.key === searchParams.dueIn),
        [searchParams.dueIn]
    )

    const { data, isFetching } = useSuspenseQuery(
        jobsListOptions({
            ...params,
            sort: [params.sort || DEFAULT_SORT],
            dueAtFrom: dueInRange?.from?.toISOString().split('T')[0],
            dueAtTo: dueInRange?.to?.toISOString()?.split('T')[0],
        })
    )

    const jobs = data.jobs
    const paginate = data.paginate

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))

    const statusFilter = useMemo(() => {
        if (!searchParams.status) return new Set<string>([])
        return new Set(searchParams.status.split(','))
    }, [searchParams.status])

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
    const [bulkActionType, setBulkActionType] = useState<
        'DELETE' | 'STATUS' | 'PRIORITY' | 'EXPORT' | null
    >(null)

    const onBulkAction = (
        type: 'DELETE' | 'STATUS' | 'PRIORITY' | 'EXPORT'
    ) => {
        setBulkActionType(type)
        onOpen()
    }

    const handleBulkConfirm = () => {
        const selectedIds =
            selectedKeys === 'all'
                ? jobs.map((j: TJob) => j.id)
                : Array.from(selectedKeys)

        console.log(`Performing ${bulkActionType} on:`, selectedIds)
        setSelectedKeys(new Set([]))
        onClose()
    }

    const pagination = {
        limit: paginate?.limit ?? 10,
        page: paginate?.page ?? 1,
        totalPages: paginate?.totalPages ?? 1,
        total: paginate?.total ?? 0,
    }

    const selectionCount =
        selectedKeys === 'all' ? pagination.total : selectedKeys.size
    const hasSelection = selectionCount > 0

    return (
        <>
            <JobManagementTable
                data={jobs}
                isLoadingData={isFetching}
                pagination={pagination}
                sort={searchParams.sort ?? DEFAULT_SORT}
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                statusFilter={statusFilter}
                onBulkAction={onBulkAction}
                searchParams={searchParams}
            />

            {hasSelection && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-6 fade-in duration-200 shadow-2xl rounded-2xl">
                    <Card className="border border-default-200 bg-background/90 backdrop-blur-md overflow-visible">
                        <CardBody className="flex flex-row items-center gap-1 py-2 px-3">
                            <div className="flex flex-col px-3">
                                <span className="text-sm font-bold text-default-900 leading-none">
                                    {selectionCount}
                                </span>
                                <span className="text-[10px] text-default-500 uppercase tracking-wider font-semibold">
                                    Selected
                                </span>
                            </div>
                            <Divider
                                orientation="vertical"
                                className="h-8 mx-2"
                            />
                            <Button
                                size="sm"
                                variant="light"
                                className="font-medium text-default-700"
                                startContent={<CheckCircle2 size={16} />}
                                onPress={() => onBulkAction('STATUS')}
                            >
                                Update Status
                            </Button>
                            <Button
                                size="sm"
                                variant="light"
                                className="font-medium text-default-700"
                                startContent={<AlertCircle size={16} />}
                                onPress={() => onBulkAction('PRIORITY')}
                            >
                                Update Priority
                            </Button>
                            <Button
                                size="sm"
                                variant="light"
                                className="font-medium text-default-700"
                                startContent={<Download size={16} />}
                                onPress={() => onBulkAction('EXPORT')}
                            >
                                Export Jobs
                            </Button>
                            <Button
                                size="sm"
                                color="danger"
                                variant="light"
                                className="font-medium"
                                startContent={<Trash2 size={16} />}
                                onPress={() => onBulkAction('DELETE')}
                            >
                                Delete
                            </Button>
                            <Divider
                                orientation="vertical"
                                className="h-8 mx-2"
                            />
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="rounded-full"
                                onPress={() => setSelectedKeys(new Set([]))}
                            >
                                <X size={16} />
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            )}

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onModalClose) => (
                        <>
                            <ModalHeader>Confirm Action</ModalHeader>
                            <ModalBody>
                                <p className="text-default-600">
                                    Are you sure you want to process this action
                                    on{' '}
                                    <strong className="text-default-900">
                                        {selectionCount}
                                    </strong>{' '}
                                    selected jobs?
                                </p>
                                {bulkActionType === 'DELETE' && (
                                    <p className="text-xs text-danger-600 mt-2 bg-danger-50 p-2 rounded-md">
                                        Warning: This action is permanent and
                                        cannot be undone.
                                    </p>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onModalClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color={
                                        bulkActionType === 'DELETE'
                                            ? 'danger'
                                            : 'primary'
                                    }
                                    onPress={handleBulkConfirm}
                                >
                                    Confirm
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
