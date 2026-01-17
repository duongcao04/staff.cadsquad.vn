import JobDetailDrawer from '@/features/job-details/components/drawers/JobDetailDrawer'
import {
    pCenterTableStore,
    ProjectCenterMobileContent,
    ProjectCenterTabs,
    ProjectCenterViewColumnsDrawer,
} from '@/features/project-center'
import AddAttachmentsModal from '@/features/project-center/components/modals/AddAttachmentsModal'
import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import { ProjectCenterPagination } from '@/features/project-center/components/ProjectCenterPagination'
import { ProjectCenterToolbar } from '@/features/project-center/components/ProjectCenterToolbar'
import ProjectCenterTable from '@/features/project-center/components/views/ProjectCenterTable'
import { getPageTitle, STORAGE_KEYS } from '@/lib'
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
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import lodash from 'lodash'
import { Suspense, useMemo, useState, useTransition } from 'react'
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
    head: () => ({ meta: [{ title: getPageTitle('Project Center') }] }),
    validateSearch: (search) => projectCenterParamsSchema.parse(search),
    parseParams: (params) => {
        const result = z.nativeEnum(ProjectCenterTabEnum).safeParse(params.tab)
        if (!result.success)
            throw redirect({ href: '/project-center/priority' })
        return { tab: result.data }
    },
    loaderDeps: ({ search }) => ({ search }),
    loader: async ({ context, deps, params }) => {
        await Promise.all([
            context.queryClient.ensureQueryData(jobStatusesListOptions()),
            context.queryClient.ensureQueryData(jobTypesListOptions()),
            context.queryClient.ensureQueryData(paymentChannelsListOptions()),
            context.queryClient.ensureQueryData(usersListOptions()),
        ])
        let hideFinishItems: '1' | '0' = '1'
        if (typeof window !== 'undefined') {
            const val = localStorage.getItem(
                STORAGE_KEYS.projectCenterFinishItems
            )
            hideFinishItems = val === 'true' ? '1' : '0'
        }
        void context.queryClient.ensureQueryData(
            jobsListOptions({
                ...deps.search,
                tab: params.tab,
                hideFinishItems,
            })
        )
    },
    component: ProjectCenterPage,
})

// --- Layout ---

function ProjectCenterPage() {
    const { tab } = Route.useParams()
    const navigate = Route.useNavigate()
    const { search, isPending } = useProjectCenterFilters()
    const [_, startTransition] = useTransition()

    const handleTabChange = (t: ProjectCenterTabEnum) => {
        startTransition(() => {
            navigate({
                to: '/project-center/$tab',
                params: { tab: t },
                search: { ...search, page: 1 },
                replace: true,
            })
        })
    }

    return (
        <div className="size-full space-y-5">
            <ProjectCenterTabs currentTab={tab} onTabChange={handleTabChange} />
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
}: {
    tab: ProjectCenterTabEnum
    search: TProjectCenterSearch
    isPending: boolean
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
                <div className="flex flex-col gap-4 h-full">
                    {/* A. Toolbar */}
                    <ProjectCenterToolbar
                        searchKeywords={search.search}
                        onSearchKeywordsChange={(val) =>
                            val
                                ? debouncedSearchChange(val)
                                : onSearchChange(undefined)
                        }
                        isLoadingData={isPending}
                        onRefresh={() => {
                            /* Invalidate */
                        }}
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
    localShowFinishItems,
    onPageChange,
    onSortChange,
    onLimitChange,
    onJobAction,
}: any) {
    const { data, isFetching, refetch } = useSuspenseQuery({
        ...jobsListOptions({
            ...search,
            tab,
            hideFinishItems: localShowFinishItems ? '1' : '0',
        }),
        // NOTE: placeholderData removed as discussed to fix Typescript issue
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
