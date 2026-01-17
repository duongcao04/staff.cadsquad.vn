import { useProfile } from '@/lib'
import { getAllowedJobColumns } from '@/lib/utils'
import {
    HeroTable,
    HeroTableBody,
    HeroTableCell,
    HeroTableColumn,
    HeroTableHeader,
    HeroTableRow,
} from '@/shared/components'
import { JobColumnKey, TJob } from '@/shared/types'
import { Selection, Spinner } from '@heroui/react'
import { useStore } from '@tanstack/react-store'
import { useCallback, useMemo } from 'react'
import { renderWorkbenchCell } from '../../helpers/renderWorkbenchCell'
import { workbenchStore } from '../../stores/_workbench.store'

type Props = {
    data: TJob[]
    isLoadingData: boolean
    sort: string

    // Sorting Action
    onSortChange: (sort: string) => void

    // Business Actions (Cell actions)
    onRefresh: () => void
    onViewDetail: (jobNo: string) => void
    onAssignMember: (jobNo: string) => void
    onAddAttachments: (jobNo: string) => void
}

export default function WorkbenchTable({
    data,
    isLoadingData,
    sort,
    onSortChange,
    onRefresh,
    onViewDetail,
    onAssignMember,
    onAddAttachments,
}: Props) {
    const { userPermissions } = useProfile()

    // --- Store ---
    const selectedKeys = useStore(workbenchStore, (s) => s.selectedKeys)
    const visibleColumnKeys = useStore(workbenchStore, (s) => s.tableColumns)
    const setSelectedKeys = (keys: Selection) => {
        workbenchStore.setState((s) => ({
            ...s,
            selectedKeys:
                keys === 'all' ? 'all' : new Set(keys as unknown as string[]),
        }))
    }

    // --- Columns Logic ---
    const allAllowedColumns = useMemo(
        () => getAllowedJobColumns('all', userPermissions),
        [userPermissions]
    )
    const headerColumns = useMemo(() => {
        if (visibleColumnKeys === 'all') return allAllowedColumns
        return allAllowedColumns.filter((col) =>
            visibleColumnKeys.includes(col.uid)
        )
    }, [allAllowedColumns, visibleColumnKeys])

    // --- Cell Logic ---
    const cellActions = useMemo(
        () => ({ onViewDetail, onAssignMember, onRefresh, onAddAttachments }),
        [onViewDetail, onAssignMember, onRefresh, onAddAttachments]
    )
    const cellRenderer = useCallback(
        (item: TJob, key: JobColumnKey) =>
            renderWorkbenchCell(item, key, cellActions),
        [cellActions]
    )

    return (
        <HeroTable
            isHeaderSticky
            aria-label="Workbench table"
            bottomContentPlacement="outside"
            sortString={sort}
            onSortStringChange={onSortChange}
            selectedKeys={selectedKeys}
            selectionMode="single"
            onSelectionChange={setSelectedKeys}
            onRowAction={(key) => onViewDetail(key as string)}
            classNames={{
                table: !isLoadingData ? 'relative' : 'relative min-h-[430px]!',
            }}
        >
            <HeroTableHeader columns={headerColumns}>
                {(column) => (
                    <HeroTableColumn
                        key={column.uid}
                        align={
                            [
                                'action',
                                'dueAt',
                                'totalStaffCost',
                                'staffCost',
                            ].includes(column.uid)
                                ? 'end'
                                : 'start'
                        }
                        allowsSorting={column.sortable}
                    >
                        {column.displayName}
                    </HeroTableColumn>
                )}
            </HeroTableHeader>
            <HeroTableBody
                emptyContent="No jobs found on your workbench."
                items={isLoadingData ? [] : data}
                isLoading={isLoadingData}
                loadingContent={<Spinner label="Loading..." />}
            >
                {(item) => (
                    <HeroTableRow key={item.no}>
                        {(columnKey) => (
                            <HeroTableCell>
                                {cellRenderer(item, columnKey as JobColumnKey)}
                            </HeroTableCell>
                        )}
                    </HeroTableRow>
                )}
            </HeroTableBody>
        </HeroTable>
    )
}
