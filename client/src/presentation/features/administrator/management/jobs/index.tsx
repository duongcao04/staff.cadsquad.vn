import { ProjectCenterTabEnum } from '@/presentation/enums'
import {
    CreateJobModal,
    getDueInPresets,
    JobManagementGrid,
    JobManagementStats,
    JobManagementStatsSkeleton,
    JobManagementTable,
    JobManagementTableToolbar,
    MobileJobManagementToolbar,
} from '@/presentation/features/job-manage'
import { ProtectedRoute } from '@/presentation/guards/protected-route'
import { useDevice } from '@/presentation/hooks'
import { APP_PERMISSIONS } from '@/presentation/lib'
import { jobsListOptions } from '@/presentation/lib/queries'
import { TJob } from '@/presentation/types'
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
    useDisclosure,
} from '@heroui/react'
import { HeroButton } from '@presentation/components'
import AdminContentContainer from '@presentation/components/admin/AdminContentContainer'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import {
    AlertCircle,
    CheckCircle2,
    Download,
    PlusIcon,
    Trash2,
    X,
} from 'lucide-react'
import { Suspense, useMemo, useState } from 'react'
import { EJobManagementTableTabs } from '../../../../routes/_administrator/mgmt/jobs'

export function JobManagementPage() {
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
}

function ManageJobLayout({
    badgeCount,
    children,
}: {
    badgeCount?: number
    children: React.ReactNode
}) {
    const { isSmallView } = useDevice()
    const createJobModalState = useDisclosure({ id: 'CreateJobModal' })
    return (
        <>
            {createJobModalState.isOpen && (
                <CreateJobModal
                    isOpen={createJobModalState.isOpen}
                    onClose={createJobModalState.onClose}
                />
            )}

            <AdminContentContainer
                headerProps={{
                    title: 'All Jobs',
                    showBadge: !isSmallView,
                    badgeCount,
                    showActions: !isSmallView,
                    actions: (
                        <HeroButton
                            color="primary"
                            className="px-6"
                            startContent={<PlusIcon size={16} />}
                            onPress={createJobModalState.onOpen}
                        >
                            New Job
                        </HeroButton>
                    ),
                }}
            >
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
    const { isSmallView } = useDevice()

    const searchParams = useSearch({
        from: '/_administrator/mgmt/jobs/',
    })
    const { dateRange, ...params } = searchParams

    const dueInPresets = getDueInPresets()
    const dueInRange = useMemo(
        () => dueInPresets.find((it) => it.key === searchParams.dueIn),
        [searchParams.dueIn]
    )

    const { data, isFetching, refetch } = useSuspenseQuery(
        jobsListOptions({
            ...params,
            dueAtFrom: dueInRange?.from?.toISOString().split('T')[0],
            dueAtTo: dueInRange?.to?.toISOString()?.split('T')[0],
            tab:
                searchParams.tab === EJobManagementTableTabs.ALL
                    ? undefined
                    : (searchParams.tab as ProjectCenterTabEnum),
        })
    )

    const jobs = useMemo(() => data.jobs, [data.jobs])
    const paginate = useMemo(() => data.paginate, [data.paginate])

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))

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
            {isSmallView ? (
                <MobileJobManagementToolbar
                    searchParams={searchParams}
                    isLoadingData={isFetching}
                    onRefetch={refetch}
                />
            ) : (
                <JobManagementTableToolbar
                    searchParams={searchParams}
                    isLoadingData={isFetching}
                    onRefetch={refetch}
                />
            )}

            {isSmallView ? (
                <JobManagementGrid
                    data={jobs}
                    isLoadingData={isFetching}
                    pagination={pagination}
                    sort={searchParams.sort}
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    onBulkAction={onBulkAction}
                    searchParams={searchParams}
                    onRefetch={refetch}
                />
            ) : (
                <JobManagementTable
                    data={jobs}
                    isLoadingData={isFetching}
                    pagination={pagination}
                    sort={searchParams.sort}
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    onBulkAction={onBulkAction}
                    searchParams={searchParams}
                    onRefetch={refetch}
                />
            )}

            {hasSelection && (
                <div className="fixed z-50 duration-200 transform -translate-x-1/2 shadow-2xl bottom-8 left-1/2 animate-in slide-in-from-bottom-6 fade-in rounded-2xl">
                    <Card className="overflow-visible border border-default-200 bg-background/90 backdrop-blur-md">
                        <CardBody className="flex flex-row items-center gap-1 px-3 py-2">
                            <div className="flex flex-col px-3">
                                <span className="text-sm font-bold leading-none text-default-900">
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
                                    <p className="p-2 mt-2 text-xs rounded-md text-danger-600 bg-danger-50">
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
