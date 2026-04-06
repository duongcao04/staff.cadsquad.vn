import JobDetailDrawer from '@/features/job-details/components/drawers/JobDetailDrawer'
import AddAttachmentsModal from '@/features/project-center/components/modals/AddAttachmentsModal'
import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import {
    WorkbenchMobileContent,
    WorkbenchMobileSkeleton,
    WorkbenchToolbar,
    WorkbenchViewColumnsDrawer,
} from '@/features/workbench'
import { jobsListOptions, workbenchDataOptions } from '@/lib/queries'
import { jobFiltersSchema, TJobFilters } from '@/lib/validationSchemas'
import { PageHeading } from '@/shared/components'
import { useDevice } from '@/shared/hooks'
import {
    Button,
    Pagination,
    Select,
    SelectItem,
    Spinner,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import lodash from 'lodash'
import { Suspense, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { z } from 'zod'
import WorkbenchTable from '../../../features/workbench/components/views/WorkbenchTable'
import { RouteUtil, TABLE_ROW_PER_PAGE_OPTIONS } from '../../../lib'
import { useWorkbenchFilters } from './-hooks/useWorkbenchFilters'

const DEFAULT_SORT = 'displayName:asc'
export const workbenchParamsSchema = z
    .object({
        sort: z.string().optional().catch(DEFAULT_SORT),
        search: z.string().trim().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().catch(10),
        page: z.coerce.number().int().min(1).optional().catch(1),
        showAll: z.coerce.boolean().optional().catch(false),
    })
    .merge(jobFiltersSchema)
export type TWorkbenchSearch = z.infer<typeof workbenchParamsSchema>

export const Route = createFileRoute('/_workspace/_workbench/')({
    head: () => ({ meta: [{ title: 'Workbench' }] }),
    validateSearch: (search) => workbenchParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context, deps }) => {
        const {
            limit = 10,
            page = 1,
            search,
            sort = DEFAULT_SORT,
        } = deps.search
        void context.queryClient.ensureQueryData(
            workbenchDataOptions({ limit, page, search, sort: [sort] })
        )
    },
    component: WorkbenchPage,
})

function WorkbenchPage() {
    const { isSmallView } = useDevice()
    return (
        <>
            <PageHeading
                title="Workbench"
                classNames={{
                    wrapper: `${isSmallView ? '!py-3' : '!py-2'} pl-6 pr-3.5 border-b border-border-default`,
                }}
            />
            <div
                className={`size-full ${isSmallView ? 'container' : 'pl-5 pr-3.5'} pt-5`}
            >
                <ErrorBoundary
                    fallback={
                        <div className="p-10 text-center text-danger">
                            <p>Failed to load data</p>
                            <Button onPress={() => window.location.reload()}>
                                Retry
                            </Button>
                        </div>
                    }
                >
                    <WorkbenchPageContent />
                </ErrorBoundary>
            </div>
        </>
    )
}

function WorkbenchPageContent() {
    const { isSmallView } = useDevice()
    const {
        search,
        isPending,
        onFiltersChange,
        onPageChange,
        onSearchChange,
        onSortChange,
    } = useWorkbenchFilters()

    // Modals
    const [selectedJob, setSelectedJob] = useState<string | null>(null)
    const viewColDisclosure = useDisclosure()
    const jobDetailDisclosure = useDisclosure()
    const assignMemberDisclosure = useDisclosure()
    const attachmentsDisclosure = useDisclosure()

    const handleAction = (
        action: 'view' | 'assign' | 'attachments',
        jobNo: string
    ) => {
        setSelectedJob(jobNo)
        if (action === 'view') jobDetailDisclosure.onOpen()
        if (action === 'assign') assignMemberDisclosure.onOpen()
        if (action === 'assign') assignMemberDisclosure.onOpen()
        if (action === 'attachments') attachmentsDisclosure.onOpen()
    }

    const closeModals = () => {
        setSelectedJob(null)
        jobDetailDisclosure.onClose()
        assignMemberDisclosure.onClose()
    }

    const debouncedSearchChange = useMemo(
        () => lodash.debounce((val: string) => onSearchChange(val), 500),
        [onSearchChange]
    )

    const {
        data: { jobs, paginate },
        isFetching,
        refetch,
    } = useSuspenseQuery({
        ...jobsListOptions({
            ...search,
            limit: search.limit,
            page: search.page,
            sort: [search.sort ?? DEFAULT_SORT],
            isAll: search.showAll ? '1' : '0',
        }),
    })

    const pagination = useMemo(
        () => ({
            limit: paginate?.limit ?? 10,
            page: paginate?.page ?? 1,
            totalPages: paginate?.totalPages ?? 1,
            total: paginate?.total ?? 0,
        }),
        [paginate]
    )

    return (
        <>
            {/* Drawers */}
            {viewColDisclosure.isOpen && (
                <WorkbenchViewColumnsDrawer
                    isOpen
                    onClose={viewColDisclosure.onClose}
                />
            )}
            {attachmentsDisclosure.isOpen && selectedJob && (
                <AddAttachmentsModal
                    isOpen
                    onClose={viewColDisclosure.onClose}
                    jobNo={selectedJob}
                />
            )}
            {selectedJob && (
                <>
                    <JobDetailDrawer
                        jobNo={selectedJob}
                        isOpen={jobDetailDisclosure.isOpen}
                        onClose={closeModals}
                    />
                    <AssignMemberModal
                        jobNo={selectedJob}
                        isOpen={assignMemberDisclosure.isOpen}
                        onClose={closeModals}
                    />
                </>
            )}

            {isSmallView ? (
                <Suspense fallback={<WorkbenchMobileSkeleton />}>
                    <WorkbenchMobileContent
                        currentPage={search.page ?? 1}
                        search={search.search}
                        onPageChange={onPageChange}
                        onSearchChange={onSearchChange}
                    />
                </Suspense>
            ) : (
                <div className="flex flex-col gap-4">
                    {/* A. Toolbar (Always Visible) */}
                    <WorkbenchToolbar
                        search={search.search}
                        filters={search as TJobFilters}
                        isLoadingData={isPending}
                        onSearchChange={(val) =>
                            val
                                ? debouncedSearchChange(val)
                                : onSearchChange(undefined)
                        }
                        onFiltersChange={onFiltersChange}
                        onRefresh={() => {
                            /* Trigger invalidation */
                        }}
                        openViewColDrawer={viewColDisclosure.onOpen}
                    />

                    {/* B. Table Data (Suspended) */}
                    <div
                        className={`${isPending ? 'opacity-70 pointer-events-none' : 'opacity-100'} transition-opacity min-h-125 flex flex-col h-full space-y-4`}
                    >
                        <Suspense fallback={<TableLoadingFallback />}>
                            <WorkbenchTable
                                data={jobs}
                                isLoadingData={isFetching}
                                // Pagination props đã bị loại bỏ khỏi đây
                                sort={search.sort ?? DEFAULT_SORT}
                                onSortChange={onSortChange}
                                onRefresh={refetch}
                                onViewDetail={(jobNo) =>
                                    handleAction('view', jobNo)
                                }
                                onAssignMember={(jobNo) =>
                                    handleAction('assign', jobNo)
                                }
                                onAddAttachments={(jobNo) =>
                                    handleAction('attachments', jobNo)
                                }
                            />

                            {/* 2. PAGINATION (Nằm ngay bên dưới Table) */}
                            <div className="flex justify-between items-center">
                                <Select
                                    className="w-40"
                                    label="Rows per page"
                                    variant="bordered"
                                    size="sm"
                                    defaultSelectedKeys={[
                                        pagination.limit.toString(),
                                    ]}
                                    onSelectionChange={(keys) => {
                                        if (!keys.anchorKey) {
                                            RouteUtil.updateParams<TWorkbenchSearch>(
                                                {
                                                    limit: undefined,
                                                    page: undefined,
                                                    showAll: true,
                                                }
                                            )
                                        } else {
                                            const limit = Number(
                                                Array.from(keys)[0]
                                            )
                                            RouteUtil.updateParams<TWorkbenchSearch>(
                                                {
                                                    limit,
                                                    page: 1,
                                                    showAll: false,
                                                }
                                            )
                                        }
                                    }}
                                >
                                    {TABLE_ROW_PER_PAGE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value}>
                                            {opt.displayName}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Pagination
                                    isCompact
                                    showControls
                                    color="primary"
                                    page={pagination.page}
                                    total={pagination.totalPages}
                                    onChange={onPageChange}
                                />
                                <div className="w-40" />
                            </div>
                        </Suspense>
                    </div>
                </div>
            )}
        </>
    )
}

function TableLoadingFallback() {
    return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-divider bg-background">
            <Spinner size="lg" color="primary" label="Loading workbench..." />
        </div>
    )
}
