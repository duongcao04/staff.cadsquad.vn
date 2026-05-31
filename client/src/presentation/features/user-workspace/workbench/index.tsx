import { JobDetailDrawer } from '@/presentation/features/job-details'
import AddAttachmentsModal from '@/presentation/features/user-workspace/project-center/_components/modals/AddAttachmentsModal'
import AssignMemberModal from '@/presentation/features/user-workspace/project-center/_components/modals/AssignMemberModal'
import { useDevice } from '@/presentation/hooks'
import { workbenchDataOptions } from '@/presentation/lib/queries'
import { TJobFilters } from '@/presentation/lib/validationSchemas'
import {
    Button,
    Pagination,
    Select,
    SelectItem,
    useDisclosure,
} from '@heroui/react'
import { PageHeading } from '@presentation/components'
import { useSuspenseQuery } from '@tanstack/react-query'
import lodash from 'lodash'
import { Suspense, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { TableLoadingFallback } from '../../../components/ui/table-loading-fallback'
import { RouteUtil, TABLE_ROW_PER_PAGE_OPTIONS } from '../../../lib'
import { TWorkbenchSearch } from '../../../routes/_workspace/_workbench'
import {
    WorkbenchMobileContent,
    WorkbenchMobileSkeleton,
} from './_components/views/WorkbenchMobileContent'
import WorkbenchTable from './_components/views/WorkbenchTable'
import { WorkbenchViewColumnsDrawer } from './_components/views/WorkbenchViewColumnsDrawer'
import { WorkbenchToolbar } from './_components/WorkbenchToolbar'
import { useWorkbenchFilters } from './hooks/use-workbench-filters'

export function WorkbenchPage() {
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
        ...workbenchDataOptions({
            ...search,
            limit: search.limit,
            page: search.page,
            sort: [search.sort],
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
                        onRefresh={refetch}
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
                                sort={search.sort}
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
