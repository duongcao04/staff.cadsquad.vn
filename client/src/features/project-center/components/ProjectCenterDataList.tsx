import { TJobFilters } from '@/lib/validationSchemas'
import { ProjectCenterTabEnum } from '@/shared/enums'
import type { JobColumnKey, TJob } from '@/shared/types'
import { ProjectCenterPagination } from './ProjectCenterPagination'
import { ProjectCenterToolbar } from './ProjectCenterToolbar'
import { useStore } from '@tanstack/react-store'
import { pCenterTableStore } from '@/features/project-center'
import ProjectCenterTable from './views/ProjectCenterTable'

// Use this component as the "Smart" container if you aren't doing it in the route file
// Props match what the original big component took
type ProjectCenterDataListProps = {
    data: TJob[]
    tab: ProjectCenterTabEnum
    isLoadingData: boolean
    sort?: string
    searchKeywords?: string
    pagination: {
        limit: number
        page: number
        totalPages: number
        total: number
    }
    onRefresh: () => void
    onSearchKeywordsChange: (newKeyword?: string) => void
    onLimitChange: (l: number) => void
    onPageChange: (p: number) => void
    onSortChange: (s: string) => void
    onFiltersChange: (newFilters: TJobFilters) => void
    filters: Partial<TJobFilters>
    visibleColumns: 'all' | JobColumnKey[]
    showFinishItems: boolean
    onDownloadCsv: () => void
    onShowFinishItemsChange?: (state: boolean) => void
    openViewColDrawer: () => void
    openJobDetailDrawer: (jobNo: string) => void
    onAssignMember: (jobNo: string) => void
    onAddAttachments: (jobNo: string) => void
}

export default function ProjectCenterDataList(
    props: ProjectCenterDataListProps
) {
    const selectedKeys = useStore(
        pCenterTableStore,
        (state) => state.selectedKeys
    )

    return (
        <div className="flex flex-col h-full gap-4">
            {/* 1. Toolbar */}
            <ProjectCenterToolbar
                searchKeywords={props.searchKeywords}
                onSearchKeywordsChange={props.onSearchKeywordsChange}
                isLoadingData={props.isLoadingData}
                onRefresh={props.onRefresh}
                filters={props.filters}
                onFiltersChange={props.onFiltersChange}
                openViewColDrawer={props.openViewColDrawer}
                onDownloadCsv={props.onDownloadCsv}
                tab={props.tab}
                selectedKeys={selectedKeys}
            />

            {/* 2. Table */}
            <div className="flex-1 min-h-0">
                <ProjectCenterTable
                    data={props.data}
                    isLoadingData={props.isLoadingData}
                    visibleColumns={props.visibleColumns}
                    sort={props.sort}
                    onSortChange={props.onSortChange}
                    onRefresh={props.onRefresh}
                    openJobDetailDrawer={props.openJobDetailDrawer}
                    onAssignMember={props.onAssignMember}
                    onAddAttachments={props.onAddAttachments}
                />
            </div>

            {/* 3. Pagination */}
            <ProjectCenterPagination
                pagination={props.pagination}
                onLimitChange={props.onLimitChange}
                onPageChange={props.onPageChange}
            />
        </div>
    )
}
