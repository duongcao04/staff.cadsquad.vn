import { CreateJobModal } from '@/features/job-manage'
import AdminManagementJobsTable from '@/features/job-manage/components/views/AdminManagementJobsTable'
import { getPageTitle } from '@/lib'
import { jobsListOptions } from '@/lib/queries'
import {
    AdminPageHeading,
    HeroButton,
    HeroDateRangePicker,
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
    SharedSelection,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import lodash from 'lodash'
import {
    AlertCircle,
    CheckCircle2,
    Download,
    PlusIcon,
    Trash2,
    X,
} from 'lucide-react'
import { startTransition, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { adminJobStatsOptions } from '../../../../lib/queries/options/administrator-queries'
import { IPaginate } from '../../../../shared/interfaces'

const DEFAULT_SORT = 'displayName:asc'

export const manageJobsParamsSchema = z.object({
    sort: z.string().optional().catch(DEFAULT_SORT),
    search: z.string().trim().optional(),
    status: z.string().optional(), // Đã thêm status vào schema
    limit: z.coerce.number().int().min(1).max(100).optional().catch(10),
    page: z.coerce.number().int().min(1).optional().catch(1),
})

export type TManageJobsParams = z.infer<typeof manageJobsParamsSchema>

export const Route = createFileRoute('/_administrator/mgmt/jobs/')({
    head: () => ({
        meta: [{ title: getPageTitle('Job Management') }],
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
        } = deps.search
        return context.queryClient.ensureQueryData(
            jobsListOptions({
                limit,
                page,
                search,
                status, // Truyền status vào API
                sort: [sort],
            })
        )
    },
    component: () => {
        const searchParams = Route.useSearch()

        const createJobModalDisclosure = useDisclosure({ id: 'CreateJobModal' })

        const [
            {
                data: { jobs, paginate },
                isFetching,
            },
            {
                data: { delivered, finished, late, ongoing, total },
            },
        ] = useSuspenseQueries({
            queries: [
                jobsListOptions({
                    ...searchParams,
                    sort: [searchParams.sort || DEFAULT_SORT],
                }),
                adminJobStatsOptions({}),
            ],
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
                    title="All Jobs"
                    showBadge
                    badgeCount={paginate?.total}
                    actions={
                        <HeroButton
                            color="primary"
                            className="px-6"
                            startContent={<PlusIcon size={16} />}
                            onPress={createJobModalDisclosure.onOpen}
                        >
                            New Job
                        </HeroButton>
                    }
                />

                <AdminContentContainer className="relative space-y-6">
                    <JobStats
                        totalJobs={total}
                        deliveredJobs={delivered}
                        finishedJobs={finished}
                        lateJobs={late}
                        ongoingJobs={ongoing}
                    />
                    <ManageJobsPage
                        jobs={jobs}
                        paginate={paginate}
                        isLoadingJobs={isFetching}
                    />
                </AdminContentContainer>
            </>
        )
    },
})

interface JobStatsProps {
    totalJobs: number
    ongoingJobs: number
    deliveredJobs: number
    lateJobs: number
    finishedJobs: number
}
function JobStats({
    totalJobs,
    ongoingJobs,
    deliveredJobs,
    lateJobs,
    finishedJobs,
}: JobStatsProps) {
    const STATS_DATA = [
        {
            title: 'Total Jobs This Month',
            count: totalJobs,
            color: 'bg-primary-500',
        },
        { title: 'Ongoing Jobs', count: ongoingJobs, color: 'bg-warning-500' },
        {
            title: 'Delivered Jobs',
            count: deliveredJobs,
            color: 'bg-secondary-500',
        },
        { title: 'Late Jobs', count: lateJobs, color: 'bg-danger-500' },
        {
            title: 'Finished Jobs',
            count: finishedJobs,
            color: 'bg-success-500',
        },
    ]
    return (
        <div>
            <HeroDateRangePicker />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {STATS_DATA.map((stat, idx) => (
                    <Card
                        key={idx}
                        shadow="none"
                        className="border border-border-default"
                    >
                        <CardBody className="p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`w-2.5 h-2.5 rounded-full ${stat.color}`}
                                />
                                <span className="text-xs font-semibold text-default-500 truncate">
                                    {stat.title}
                                </span>
                            </div>
                            <span className="text-2xl font-bold text-default-900">
                                {stat.count}
                            </span>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    )
}

interface ManageJobsPageProps {
    jobs: TJob[]
    paginate?: IPaginate
    isLoadingJobs: boolean
}
function ManageJobsPage({
    jobs,
    paginate,
    isLoadingJobs,
}: ManageJobsPageProps) {
    const searchParams = Route.useSearch()
    const navigate = useNavigate({ from: Route.fullPath })

    // --- Local UI State ---
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
    const [searchValue, setSearchValue] = useState(searchParams.search || '')

    // --- Status Filter Logic ---
    // Đồng bộ từ URL xuống Table
    const statusFilter = useMemo(() => {
        if (!searchParams.status) return new Set([])
        return new Set(searchParams.status.split(','))
    }, [searchParams.status])

    // Xử lý khi user click chọn status trên Table
    const handleStatusFilterChange = (keys: SharedSelection) => {
        let statusValue: string | undefined = undefined

        if (keys !== 'all' && keys.size > 0) {
            statusValue = Array.from(keys).join(',')
        }

        navigate({
            search: (old) => ({
                ...old,
                status: statusValue,
                page: 1, // Reset page
            }),
            replace: true,
        })
    }

    // --- Search Logic ---
    const updateSearch = (
        updater: (old: TManageJobsParams) => TManageJobsParams
    ) => {
        startTransition(() => {
            navigate({
                search: ((old: TManageJobsParams) =>
                    updater(old as TManageJobsParams)) as unknown as true,
                replace: true,
            })
        })
    }

    const debouncedUpdateUrl = useMemo(
        () =>
            lodash.debounce((value: string) => {
                updateSearch((old) => ({
                    ...old,
                    search: value || undefined,
                    page: 1,
                }))
            }, 500),
        []
    )

    useEffect(() => {
        setSearchValue(searchParams.search || '')
    }, [searchParams.search])

    useEffect(() => {
        return () => debouncedUpdateUrl.cancel()
    }, [debouncedUpdateUrl])

    // --- Handlers ---
    const onSearchInputChange = (value: string) => {
        setSearchValue(value)
        debouncedUpdateUrl(value)
    }

    const handleClearSearch = () => {
        setSearchValue('')
        debouncedUpdateUrl.cancel()
        updateSearch((old) => ({ ...old, search: undefined, page: 1 }))
    }

    const handlePageChange = (newPage: number) => {
        navigate({ search: (prev) => ({ ...prev, page: newPage }) })
    }

    const handleSortChange = (newSort: string) => {
        navigate({
            search: (old) => ({ ...old, sort: newSort, page: 1 }),
            replace: true,
        })
    }

    // --- Bulk Actions ---
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
        // Perform API call here...

        setSelectedKeys(new Set([]))
        onClose()
    }

    const pagination = {
        limit: paginate?.limit ?? 10,
        page: paginate?.page ?? 1,
        totalPages: paginate?.totalPages ?? 1,
        total: paginate?.total ?? 0,
    }

    // --- UI Helpers ---
    const selectionCount =
        selectedKeys === 'all' ? pagination.total : selectedKeys.size
    const hasSelection = selectionCount > 0

    return (
        <>
            <AdminManagementJobsTable
                data={jobs}
                isLoadingData={isLoadingJobs}
                searchValue={searchValue}
                onSearchChange={onSearchInputChange}
                onClearSearch={handleClearSearch}
                pagination={pagination}
                onPageChange={handlePageChange}
                sort={searchParams.sort ?? DEFAULT_SORT}
                onSortChange={handleSortChange}
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                onBulkAction={onBulkAction}
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
                    {(onClose) => (
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
                                <Button variant="light" onPress={onClose}>
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
