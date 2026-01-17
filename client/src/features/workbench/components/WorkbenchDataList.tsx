import { workbenchDataOptions } from '@/lib'
import { TWorkbenchSearch } from '@/routes/_workspace/_workbench'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { WorkbenchPagination } from './WorkbenchPagination'
import WorkbenchTable from './views/WorkbenchTable'

const DEFAULT_SORT = 'displayName:asc'

export function WorkbenchDataList({
    search,
    onSortChange,
    onPageChange,
    onLimitChange,
    onViewDetail,
    onAssignMember,
    onAddAttachments,
}: {
    search: TWorkbenchSearch
    onSortChange: (val: string) => void
    onPageChange: (val: number) => void
    onLimitChange: (val: number) => void
    onViewDetail: (no: string) => void
    onAssignMember: (no: string) => void
    onAddAttachments: (no: string) => void
}) {
    const {
        data: { jobs, paginate },
        isFetching,
        refetch,
    } = useSuspenseQuery({
        ...workbenchDataOptions({
            ...search,
            limit: search.limit,
            page: search.page,
            sort: [search.sort ?? DEFAULT_SORT],
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
        <div className="flex flex-col h-full">
            {/* 1. TABLE */}
            <div className="flex-1">
                <WorkbenchTable
                    data={jobs}
                    isLoadingData={isFetching}
                    // Pagination props đã bị loại bỏ khỏi đây
                    sort={search.sort ?? DEFAULT_SORT}
                    onSortChange={onSortChange}
                    onRefresh={refetch}
                    onViewDetail={onViewDetail}
                    onAssignMember={onAssignMember}
                    onAddAttachments={onAddAttachments}
                />
            </div>

            {/* 2. PAGINATION (Nằm ngay bên dưới Table) */}
            <WorkbenchPagination
                pagination={pagination}
                onLimitChange={onLimitChange}
                onPageChange={onPageChange}
            />
        </div>
    )
}
