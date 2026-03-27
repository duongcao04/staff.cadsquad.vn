import JobDetailDrawer from '@/features/job-details/components/drawers/JobDetailDrawer'
import AddAttachmentsModal from '@/features/project-center/components/modals/AddAttachmentsModal'
import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import {
    WorkbenchDataList,
    WorkbenchMobileContent,
    WorkbenchMobileSkeleton,
    WorkbenchToolbar,
    WorkbenchViewColumnsDrawer,
} from '@/features/workbench'
import { getPageTitle } from '@/lib'
import { workbenchDataOptions } from '@/lib/queries'
import { jobFiltersSchema, TJobFilters } from '@/lib/validationSchemas'
import { PageHeading } from '@/shared/components'
import { useDevice } from '@/shared/hooks'
import { Button, Spinner, useDisclosure } from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import lodash from 'lodash'
import { Suspense, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { z } from 'zod'
import { useWorkbenchFilters } from './-hooks/useWorkbenchFilters'

const DEFAULT_SORT = 'displayName:asc'
export const workbenchParamsSchema = z
    .object({
        sort: z.string().optional().catch(DEFAULT_SORT),
        search: z.string().trim().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().catch(10),
        page: z.coerce.number().int().min(1).optional().catch(1),
    })
    .merge(jobFiltersSchema)
export type TWorkbenchSearch = z.infer<typeof workbenchParamsSchema>

export const Route = createFileRoute('/_workspace/_workbench/')({
    head: () => ({ meta: [{ title: getPageTitle('Workbench') }] }),
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
                    <WorkbenchContainer />
                </ErrorBoundary>
            </div>
        </>
    )
}

function WorkbenchContainer() {
    const { isSmallView } = useDevice()
    const {
        search,
        onFiltersChange,
        onLimitChange,
        onPageChange,
        onSearchChange,
        onSortChange,
        isPending,
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
                        className={`${isPending ? 'opacity-70 pointer-events-none' : 'opacity-100'} transition-opacity min-h-125`}
                    >
                        <Suspense fallback={<TableLoadingFallback />}>
                            <WorkbenchDataList
                                search={search}
                                onSortChange={onSortChange}
                                onPageChange={onPageChange}
                                onLimitChange={onLimitChange}
                                onViewDetail={(no) => handleAction('view', no)}
                                onAssignMember={(no) =>
                                    handleAction('assign', no)
                                }
                                onAddAttachments={(no) =>
                                    handleAction('attachments', no)
                                }
                            />
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
