import { ProjectCenterTabEnum } from '@/presentation/enums'
import { JobDetailDrawer } from '@/presentation/features/job-details'
import { useDevice } from '@/presentation/hooks'
import { jobsListOptions, useProfile } from '@/presentation/lib/queries'
import { TJobFilters } from '@/presentation/lib/validationSchemas'
import { useDisclosure } from '@heroui/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useParams, useSearch } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import lodash from 'lodash'
import { Suspense, useMemo, useState } from 'react'
import { TableLoadingFallback } from '../../../components/ui/table-loading-fallback'
import { TProjectCenterSearch } from '../../../routes/_workspace/project-center/$tab'
import AddAttachmentsModal from './_components/modals/AddAttachmentsModal'
import AssignMemberModal from './_components/modals/AssignMemberModal'
import { ProjectCenterPagination } from './_components/ProjectCenterPagination'
import { ProjectCenterTabs } from './_components/ProjectCenterTabs'
import { ProjectCenterToolbar } from './_components/ProjectCenterToolbar'
import { ProjectCenterMobileContent } from './_components/views/ProjectCenterMobileContent'
import { ProjectCenterTable } from './_components/views/ProjectCenterTable'
import { ProjectCenterViewColumnsDrawer } from './_components/views/ProjectCenterViewColumnsDrawer'
import { useProjectCenterFilters } from './hooks/useProjectCenterFilters'
import { useProjectExport } from './hooks/useProjectExport'
import { pCenterTableStore } from './stores/_project-center-table.store'

export function ProjectCenterPage() {
    const searchParams = useSearch({
        from: '/_workspace/project-center/$tab',
    })
    const { tab } = useParams({
        from: '/_workspace/project-center/$tab',
    }) as { tab: ProjectCenterTabEnum }
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
