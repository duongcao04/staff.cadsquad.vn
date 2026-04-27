import {
    getWorkbenchColumns,
    WorkbenchViewColumnsDrawer,
} from '@/features/workbench'
import {
    APP_PERMISSIONS,
    RouteUtil,
    TABLE_ROW_PER_PAGE_OPTIONS,
    useProfile,
    workbenchDataOptions,
} from '@/lib'
import { PrivilegeHelper } from '@/lib/helpers'
import {
    Pagination,
    Select,
    SelectItem,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    UseDisclosureProps,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Suspense, useMemo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { TWorkbenchSearch } from '../../../../routes/_workspace/_workbench'

type WorkbenchTableProps = {
    onViewDetail: (jobNo: string) => void
    onAssignMember: (jobNo: string) => void
    onAddAttachments: (jobNo: string) => void
    columnSettingState: UseDisclosureProps
}
export function WorkbenchTable({
    onViewDetail,
    onAssignMember,
    columnSettingState,
}: WorkbenchTableProps) {
    const {
        limit,
        page,
        search,
        sort = 'displayName:asc',
        status,
        dueAtFrom,
        dueAtTo,
    } = useSearch({ from: '/_workspace/_workbench/' })
    const { userPermissions } = useProfile()

    const queryOptions = useMemo(() => {
        return workbenchDataOptions({
            limit,
            page,
            search,
            status,
            dueAtFrom,
            dueAtTo,
            sort: [sort],
        })
    }, [limit, page, search, sort, status, dueAtFrom, dueAtTo])
    const { data: jobsData, refetch } = useSuspenseQuery(queryOptions)

    const jobs = useMemo(() => jobsData.jobs || [], [jobsData.jobs])
    const pagination = useMemo(
        () => jobsData.paginate || { page: 1, totalPages: 1, limit: 10 },
        [jobsData.paginate]
    )

    const columns = useMemo(
        () =>
            getWorkbenchColumns({
                onViewDetail,
                onAssignMember,
                onRefresh: refetch,
                userPermissions,
            }),
        [onViewDetail, onAssignMember, refetch, userPermissions]
    )

    const table = useReactTable({
        data: jobs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            columnVisibility: {
                incomeCost: PrivilegeHelper.hasPermission(
                    userPermissions,
                    APP_PERMISSIONS.JOB.READ_INCOME,
                    APP_PERMISSIONS.JOB.MANAGE
                ),
                totalStaffCost: PrivilegeHelper.hasPermission(
                    userPermissions,
                    APP_PERMISSIONS.JOB.READ_STAFF_COST,
                    APP_PERMISSIONS.JOB.MANAGE
                ),
            },
            pagination: {
                pageSize: 10,
            },
        },
    })

    const tableRows = table.getRowModel().rows
    const tableHeaders = table.getHeaderGroups()

    console.log(table.getAllFlatColumns())

    return (
        <>
            {/* Drawers */}
            {columnSettingState.isOpen && (
                <WorkbenchViewColumnsDrawer
                    isOpen
                    tableColumns={table.getAllLeafColumns()}
                    visibleColumns={table.getVisibleLeafColumns()}
                    onClose={() => columnSettingState.onClose?.()}
                />
            )}
            <Table
                isHeaderSticky
                isStriped
                aria-label="Workbench table"
                classNames={{
                    wrapper:
                        'shadow-none border border-border-default rounded-md',
                }}
                // sortString={searchParams.sort}
                // onSortStringChange={handleSortChange}
            >
                <TableHeader>
                    {tableHeaders.flatMap((headerGroup) =>
                        headerGroup.headers.map((header) => (
                            <TableColumn
                                key={header.id}
                                allowsSorting={
                                    (header.column.columnDef as any).sortable
                                }
                                align={
                                    [
                                        'action',
                                        'dueAt',
                                        'totalStaffCost',
                                        'staffCost',
                                    ].includes(header.id)
                                        ? 'end'
                                        : 'start'
                                }
                            >
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                      )}
                            </TableColumn>
                        ))
                    )}
                </TableHeader>

                <TableBody emptyContent="No jobs found on your workbench.">
                    {tableRows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="mt-4 flex justify-between items-center">
                <Select
                    className="w-40"
                    label="Rows per page"
                    variant="bordered"
                    size="sm"
                    defaultSelectedKeys={[pagination.limit.toString()]}
                    onSelectionChange={(keys) => {
                        if (!keys.anchorKey) {
                            RouteUtil.updateParams<TWorkbenchSearch>({
                                limit: undefined,
                                page: undefined,
                                showAll: true,
                            })
                        } else {
                            const limit = Number(Array.from(keys)[0])
                            RouteUtil.updateParams<TWorkbenchSearch>({
                                limit,
                                page: 1,
                                showAll: false,
                            })
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
                    // onChange={onPageChange}
                />
                <div className="w-40" />
            </div>
        </>
    )
}

export function WorkbenchTableWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ErrorBoundary
            fallback={
                <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-divider bg-background">
                    <p>Error loading ...</p>
                </div>
            }
        >
            <Suspense fallback={<WorkbenchTableLoading />}>{children}</Suspense>
        </ErrorBoundary>
    )
}

export function WorkbenchTableLoading() {
    return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-divider bg-background">
            <Spinner size="lg" color="primary" label="Loading workbench..." />
        </div>
    )
}
