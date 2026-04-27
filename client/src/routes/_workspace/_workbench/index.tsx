import { JobDetailDrawer } from '@/features/job-details'
import AddAttachmentsModal from '@/features/project-center/components/modals/AddAttachmentsModal'
import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import {
    WorkbenchMobileContent,
    WorkbenchMobileSkeleton,
    WorkbenchTable,
    WorkbenchTableWrapper,
    WorkbenchToolbar,
} from '@/features/workbench'
import { workbenchDataOptions } from '@/lib/queries'
import { jobFiltersSchema } from '@/lib/validationSchemas'
import { PageHeading } from '@/shared/components'
import { useDevice } from '@/shared/hooks'
import { Button, useDisclosure } from '@heroui/react'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import lodash from 'lodash'
import { Suspense, useCallback, useMemo, useState } from 'react'
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
            status,
            dueAtFrom,
            dueAtTo,
            sort = DEFAULT_SORT,
        } = deps.search
        const queryOptions = workbenchDataOptions({
            limit,
            page,
            search,
            status,
            dueAtFrom,
            dueAtTo,
            sort: [sort],
        })
        void context.queryClient.ensureQueryData(queryOptions)
    },
    component: () => {
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
                                <Button
                                    onPress={() => window.location.reload()}
                                >
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
    },
})

function WorkbenchPageContent() {
    const searchParams = Route.useSearch()

    const { isSmallView } = useDevice()

    const queryClient = useQueryClient()

    const { search, isPending, onPageChange, onSearchChange } =
        useWorkbenchFilters()

    const queryOptions = useMemo(() => {
        const sort = searchParams.sort ?? 'displayName:asc'
        return workbenchDataOptions({
            ...searchParams,
            sort: [sort],
        })
    }, [
        searchParams.limit,
        searchParams.page,
        searchParams.search,
        searchParams.sort,
        searchParams.status,
        searchParams.dueAtFrom,
        searchParams.dueAtTo,
    ])
    const handleRefetch = () => {
        queryClient.refetchQueries({
            queryKey: queryOptions.queryKey,
        })
    }

    // Modals
    const [selectedJob, setSelectedJob] = useState<string | null>(null)
    const viewColDisclosure = useDisclosure()
    const jobDetailDisclosure = useDisclosure()
    const assignMemberDisclosure = useDisclosure()
    const attachmentsDisclosure = useDisclosure()

    const handleAction = useCallback(
        (action: 'view' | 'assign' | 'attachments', jobNo: string) => {
            setSelectedJob(jobNo)
            if (action === 'view') jobDetailDisclosure.onOpen()
            if (action === 'assign') assignMemberDisclosure.onOpen()
            if (action === 'attachments') attachmentsDisclosure.onOpen()
        },
        [
            jobDetailDisclosure.onOpen,
            assignMemberDisclosure.onOpen,
            attachmentsDisclosure.onOpen,
        ]
    )

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
            {attachmentsDisclosure.isOpen && selectedJob && (
                <AddAttachmentsModal
                    isOpen
                    onClose={attachmentsDisclosure.onClose}
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
                        isLoadingData={isPending}
                        onSearchChange={(val) =>
                            val
                                ? debouncedSearchChange(val)
                                : onSearchChange(undefined)
                        }
                        onRefresh={handleRefetch}
                        openViewColDrawer={viewColDisclosure.onOpen}
                    />

                    {/* B. Table Data (Suspended) */}
                    <div
                        className={`${isPending ? 'opacity-70 pointer-events-none' : 'opacity-100'} transition-opacity min-h-125 flex flex-col h-full space-y-4`}
                    >
                        <WorkbenchTableWrapper>
                            <WorkbenchTable
                                onViewDetail={(jobNo) =>
                                    handleAction('view', jobNo)
                                }
                                onAssignMember={(jobNo) =>
                                    handleAction('assign', jobNo)
                                }
                                onAddAttachments={(jobNo) =>
                                    handleAction('attachments', jobNo)
                                }
                                columnSettingState={viewColDisclosure}
                            />
                        </WorkbenchTableWrapper>
                    </div>
                </div>
            )}
        </>
    )
}
