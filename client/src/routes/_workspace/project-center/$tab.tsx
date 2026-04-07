import { JobDetailDrawer } from '@/features/job-details'
import {
    pCenterTableStore,
    ProjectCenterMobileContent,
    ProjectCenterPagination,
    ProjectCenterTable,
    ProjectCenterTabs,
    ProjectCenterToolbar,
    ProjectCenterViewColumnsDrawer,
} from '@/features/project-center'
import AddAttachmentsModal from '@/features/project-center/components/modals/AddAttachmentsModal'
import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import {
    jobsListOptions,
    jobStatusesListOptions,
    jobTypesListOptions,
    paymentChannelsListOptions,
    useProfile,
    usersListOptions,
} from '@/lib/queries'
import { jobFiltersSchema, TJobFilters } from '@/lib/validationSchemas'
import { ProjectCenterTabEnum } from '@/shared/enums'
import { useDevice } from '@/shared/hooks'
import { Spinner, useDisclosure } from '@heroui/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import lodash from 'lodash'
import { Suspense, useMemo, useState } from 'react'
import { z } from 'zod'
import { useProjectCenterFilters } from './-hooks/useProjectCenterFilters'
import { useProjectExport } from './-hooks/useProjectExport'

// --- Route Definition (Unchanged) ---
const DEFAULT_SORT = 'displayName:asc'
export const projectCenterParamsSchema = z
    .object({
        sort: z.string().optional().catch(DEFAULT_SORT),
        search: z.string().trim().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().catch(10),
        page: z.coerce.number().int().min(1).optional().catch(1),
    })
    .merge(jobFiltersSchema)
export type TProjectCenterSearch = z.infer<typeof projectCenterParamsSchema>

export const Route = createFileRoute('/_workspace/project-center/$tab')({
    head: ({ params }) => {
        const title =
            'Project Center' +
            ' - ' +
            lodash.upperFirst(params.tab.trim()) +
            ' jobs'
        return { meta: [{ title }] }
    },
    validateSearch: (search) => projectCenterParamsSchema.parse(search),
    parseParams: (params) => {
        const result = z.nativeEnum(ProjectCenterTabEnum).safeParse(params.tab)
        if (!result.success)
            throw redirect({ href: '/project-center/priority' })
        return { tab: result.data }
    },
    loaderDeps: ({ search }) => ({ search }),
    loader: async ({ context, deps, params }) => {
        const { search } = deps as { search: TProjectCenterSearch }
        const { tab } = params as { tab: ProjectCenterTabEnum }

        await Promise.all([
            context.queryClient.ensureQueryData(jobStatusesListOptions()),
            context.queryClient.ensureQueryData(jobTypesListOptions()),
            context.queryClient.ensureQueryData(paymentChannelsListOptions()),
            context.queryClient.ensureQueryData(usersListOptions()),
            context.queryClient.ensureQueryData(
                jobsListOptions({
                    ...search,
                    tab,
                })
            ),
        ])
    },
    component: ProjectCenterPage,
})

function ProjectCenterPage() {
    const searchParams = Route.useSearch()
    const { tab } = Route.useParams() as { tab: ProjectCenterTabEnum }
    const { search, isPending } = useProjectCenterFilters()

    const { refetch } = useQuery(
        jobsListOptions({
            ...searchParams,
            tab,
        })
    )

    return (
        <div className="space-y-5 size-full">
            <ProjectCenterTabs currentTab={tab} />
            <div
                className={
                    isPending
                        ? 'opacity-70 transition-opacity pointer-events-none'
                        : 'opacity-100 transition-opacity'
                }
            >
                {/* Main Container does NOT use Suspense at root.
                    This allows Toolbar to stay mounted.
                */}
                <ProjectCenterContainer
                    tab={tab}
                    search={search}
                    isPending={isPending}
                    onRefresh={refetch}
                />
            </div>
        </div>
    )
}

// --- Container (Non-Suspended) ---
function ProjectCenterContainer({
    tab,
    search,
    isPending,
    onRefresh,
}: {
    tab: ProjectCenterTabEnum
    search: TProjectCenterSearch
    isPending: boolean
    onRefresh: () => void
}) {
    const { isSmallView } = useDevice()
    const { userPermissions } = useProfile()
    const {
        onFiltersChange,
        onPageChange,
        onSortChange,
        onSearchChange,
        onLimitChange,
    } = useProjectCenterFilters()
    const { handleExport } = useProjectExport(userPermissions)

    // Modals
    const [selectedJob, setSelectedJob] = useState<string | null>(null)
    const viewColDisclosure = useDisclosure()
    const jobDetailDisclosure = useDisclosure()
    const assignMemberDisclosure = useDisclosure()
    const attachmentsDisclosure = useDisclosure()
    const selectedKeys = useStore(pCenterTableStore, (s) => s.selectedKeys)

    const handleJobAction = (
        action: 'view' | 'assign' | 'attach',
        no: string
    ) => {
        setSelectedJob(no)
        if (action === 'view') jobDetailDisclosure.onOpen()
        if (action === 'assign') assignMemberDisclosure.onOpen()
        if (action === 'attach') attachmentsDisclosure.onOpen()
    }

    const closeModals = () => {
        setSelectedJob(null)
        jobDetailDisclosure.onClose()
        assignMemberDisclosure.onClose()
        attachmentsDisclosure.onClose()
    }

    const debouncedSearchChange = useMemo(
        () => lodash.debounce((value: string) => onSearchChange(value), 500),
        [onSearchChange]
    )

    return (
        <>
            {viewColDisclosure.isOpen && (
                <ProjectCenterViewColumnsDrawer
                    isOpen
                    onClose={viewColDisclosure.onClose}
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
                    <AddAttachmentsModal
                        jobNo={selectedJob}
                        isOpen={attachmentsDisclosure.isOpen}
                        onClose={closeModals}
                    />
                </>
            )}

            {isSmallView ? (
                <Suspense fallback={<TableLoadingFallback />}>
                    <ProjectCenterMobileContent
                        data={[]} // Mobile Fetch logic can be moved into its own Suspended component if needed
                        isFetching={false}
                        pagination={{
                            limit: 10,
                            page: 1,
                            totalPages: 1,
                            total: 0,
                        }}
                        onPageChange={onPageChange}
                        onSearchChange={onSearchChange}
                        onViewDetail={(no) => handleJobAction('view', no)}
                        onAssignMember={(no) => handleJobAction('assign', no)}
                        onAddAttachments={(no) => handleJobAction('attach', no)}
                        onExport={() => handleExport(search, tab)}
                    />
                </Suspense>
            ) : (
                <div className="flex flex-col h-full gap-4">
                    {/* A. Toolbar */}
                    <ProjectCenterToolbar
                        searchKeywords={search.search}
                        onSearchKeywordsChange={(val) =>
                            val
                                ? debouncedSearchChange(val)
                                : onSearchChange(undefined)
                        }
                        isLoadingData={isPending}
                        onRefresh={onRefresh}
                        filters={search as TJobFilters}
                        onFiltersChange={onFiltersChange}
                        openViewColDrawer={viewColDisclosure.onOpen}
                        onDownloadCsv={() => handleExport(search, tab)}
                        tab={tab}
                        selectedKeys={selectedKeys}
                    />

                    {/* B. Data Table (Suspended) */}
                    <Suspense fallback={<TableLoadingFallback />}>
                        <ProjectCenterDataList
                            tab={tab}
                            search={search}
                            onPageChange={onPageChange}
                            onSortChange={onSortChange}
                            onLimitChange={onLimitChange}
                            onJobAction={handleJobAction}
                        />
                    </Suspense>
                </div>
            )}
        </>
    )
}

// --- Child Component: Data List (Fetches Data) ---

function ProjectCenterDataList({
    tab,
    search,
    onPageChange,
    onSortChange,
    onLimitChange,
    onJobAction,
}: any) {
    const { data, isFetching, refetch } = useSuspenseQuery({
        ...jobsListOptions({
            ...search,
            tab,
        }),
    })

    const pagination = useMemo(
        () => ({
            limit: data?.paginate?.limit ?? 10,
            page: data?.paginate?.page ?? 1,
            totalPages: data?.paginate?.totalPages ?? 1,
            total: data?.paginate?.total ?? 0,
        }),
        [data?.paginate]
    )

    const storedColumns = useStore(
        pCenterTableStore,
        (state) => state.jobColumns
    )

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
                <ProjectCenterTable
                    data={data?.jobs ?? []}
                    isLoadingData={isFetching}
                    visibleColumns={
                        storedColumns.length > 0 ? storedColumns : 'all'
                    }
                    sort={search.sort}
                    onSortChange={onSortChange}
                    onRefresh={refetch}
                    openJobDetailDrawer={(no) => onJobAction('view', no)}
                    onAssignMember={(no) => onJobAction('assign', no)}
                    onAddAttachments={(no) => onJobAction('attach', no)}
                />
            </div>
            <ProjectCenterPagination
                pagination={pagination}
                onLimitChange={onLimitChange}
                onPageChange={onPageChange}
            />
        </div>
    )
}

function TableLoadingFallback() {
    return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-divider bg-content1/50">
            <Spinner size="lg" color="primary" label="Syncing projects..." />
        </div>
    )
}
