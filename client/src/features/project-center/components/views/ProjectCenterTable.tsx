import {
    pCenterTableStore,
    renderProjectCenterCell,
} from '@/features/project-center'
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
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area'
import { JobColumnKey, TJob } from '@/shared/types'
import { Selection, Spinner } from '@heroui/react'
import { useStore } from '@tanstack/react-store'
import { useCallback, useMemo } from 'react'

type Props = {
    data: TJob[]
    isLoadingData: boolean
    visibleColumns: 'all' | JobColumnKey[]
    sort?: string

    onSortChange: (s: string) => void
    onRefresh: () => void
    openJobDetailDrawer: (jobNo: string) => void
    onAssignMember: (jobNo: string) => void
    onAddAttachments: (jobNo: string) => void
}

export default function ProjectCenterTable({
    data,
    isLoadingData,
    visibleColumns,
    sort,
    onSortChange,
    onRefresh,
    openJobDetailDrawer,
    onAssignMember,
    onAddAttachments,
}: Props) {
    const { userPermissions } = useProfile()
    const { userRole } = useProfile()

    // --- Store Logic ---
    const selectedKeys = useStore(
        pCenterTableStore,
        (state) => state.selectedKeys
    )

    const setContextItem = (value: TJob | null) => {
        pCenterTableStore.setState((state) => ({
            ...state,
            contextItem: value,
        }))
    }

    const setSelectedKeys = (keys: Selection) => {
        pCenterTableStore.setState((state) => ({
            ...state,
            selectedKeys:
                keys === 'all' ? 'all' : new Set(keys as unknown as string[]),
        }))
    }

    // --- Header Logic ---
    const headerColumns = useMemo(
        () => getAllowedJobColumns(visibleColumns, userPermissions),
        [visibleColumns, userRole]
    )

    // --- Cell Logic ---
    const cellActions = useMemo(
        () => ({
            onViewDetail: openJobDetailDrawer,
            onAssignMember,
            onAddAttachments,
            onRefresh,
        }),
        [openJobDetailDrawer, onAssignMember, onAddAttachments, onRefresh]
    )

    const renderCell = useCallback(
        (item: TJob, columnKey: JobColumnKey) =>
            renderProjectCenterCell(item, columnKey, cellActions),
        [cellActions]
    )

    return (
        <HeroTable
            key="project-center-table"
            isHeaderSticky
            aria-label="Project center table"
            bottomContentPlacement="outside"
            selectedKeys={selectedKeys}
            selectionMode="single"
            onSelectionChange={setSelectedKeys}
            onRowAction={(key) => openJobDetailDrawer(key as string)}
            sortString={sort ?? undefined}
            onSortStringChange={onSortChange}
            BaseComponent={(found) => (
                <ScrollArea className="size-full h-full! border border-border p-2 rounded-md min-h-[calc(100%-150px)]">
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                    {found.children}
                </ScrollArea>
            )}
            classNames={{
                table: !isLoadingData ? 'relative' : 'relative min-h-[430px]!',
            }}
        >
            <HeroTableHeader columns={headerColumns}>
                {(column) => (
                    <HeroTableColumn
                        key={column.uid}
                        align={column.uid === 'action' ? 'center' : 'start'}
                        allowsSorting={column.sortable}
                        onContextMenu={() => setContextItem(null)}
                    >
                        {column.displayName}
                    </HeroTableColumn>
                )}
            </HeroTableHeader>
            <HeroTableBody
                emptyContent={'No items found'}
                items={isLoadingData ? [] : data}
                loadingContent={
                    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-content1/50">
                        <Spinner
                            size="lg"
                            color="primary"
                            label="Loading data..."
                        />
                    </div>
                }
                isLoading={isLoadingData}
            >
                {(item) => (
                    <HeroTableRow
                        key={item.no}
                        onContextMenu={() => setContextItem(item)}
                    >
                        {(columnKey) => (
                            <HeroTableCell>
                                {renderCell(item, columnKey as JobColumnKey)}
                            </HeroTableCell>
                        )}
                    </HeroTableRow>
                )}
            </HeroTableBody>
        </HeroTable>
    )
}
