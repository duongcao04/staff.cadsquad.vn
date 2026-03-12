import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Pagination,
    Selection,
    SharedSelection,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Avatar } from 'antd'
import {
    CalendarIcon,
    CheckCircle2,
    ChevronDown,
    Eye,
    MoreVertical,
    Search,
    SquareArrowOutUpRight,
    Trash2,
    TruckElectricIcon,
} from 'lucide-react'
import React, { useCallback, useMemo } from 'react'

import {
    currencyFormatter,
    dateFormatter,
    INTERNAL_URLS,
    optimizeCloudinary,
} from '../../../../lib'
import { jobStatusesListOptions } from '../../../../lib/queries'
import { TJob } from '../../../../shared/types'
import { JobStatusChip } from '../../../../shared/components/chips/JobStatusChip'
import { PaidChip } from '../../../../shared/components/chips/PaidChip'
import { HeroButton } from '../../../../shared/components/ui/hero-button'
import { HeroTable } from '../../../../shared/components/ui/hero-table'
import { HeroTooltip } from '../../../../shared/components/ui/hero-tooltip'

const columns = [
    { name: 'JOB INFO', uid: 'info', sortable: false },
    { name: 'CLIENT', uid: 'clientName', sortable: false },
    { name: 'ASSIGNEES', uid: 'assignee' },
    { name: 'INCOME', uid: 'income', sortable: false },
    { name: 'STATUS', uid: 'status', sortable: false },
    { name: 'PAID STATUS', uid: 'isPaid', sortable: false },
    { name: 'DUE DATE', uid: 'dueAt', sortable: false },
    { name: 'ACTIONS', uid: 'actions' },
]

type Pagination = {
    page: number
    totalPages: number
    limit: number
}
type AdminManagementJobsTableProps = {
    data: TJob[]
    isLoadingData: boolean
    selectedKeys: Selection
    searchValue: string
    sort: string
    pagination: Pagination
    onSortChange: (newSortValue: string) => void
    onClearSearch: () => void
    statusFilter: Selection
    onSelectionChange: (keys: Selection) => void
    onPageChange: (newPage: number) => void
    onStatusFilterChange: (keys: SharedSelection) => void
    onBulkAction: (type: 'DELETE' | 'STATUS') => void
    onSearchChange: (value: string) => void
}
export default function AdminManagementJobsTable({
    data,
    pagination,
    isLoadingData,
    selectedKeys,
    searchValue,
    statusFilter,
    sort,
    onSortChange,
    onSelectionChange,
    onPageChange,
    onStatusFilterChange,
    onClearSearch,
    onBulkAction,
    onSearchChange,
}: AdminManagementJobsTableProps) {
    const router = useRouter()

    const {
        data: { jobStatuses },
    } = useSuspenseQuery({
        ...jobStatusesListOptions(),
    })
    // --- Render Cell ---
    const renderCell = useCallback((data: TJob, columnKey: React.Key) => {
        switch (columnKey) {
            case 'info':
                return (
                    <div>
                        <p className="font-bold text-text-default">
                            {data.displayName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono bg-background-hovered text-text-subdued px-1 py-0.5 rounded">
                                {data.no}
                            </span>
                            <span className="text-xs text-text-subdued">
                                {data.type.displayName}
                            </span>
                        </div>
                    </div>
                )
            case 'clientName':
                return (
                    <p className="line-clamp-1">
                        {data.client?.name || 'Unknown client'}
                    </p>
                )
            case 'assignee':
                return !data.assignments.length ? (
                    <div className="size-full flex items-center justify-center">
                        <p className="italic text-text-subdued font-medium">
                            Un-assignees
                        </p>
                    </div>
                ) : (
                    <div onClick={() => {}} className="w-fit">
                        <Avatar.Group
                            max={{
                                count: 4,
                                style: {
                                    color: 'var(--color-primary)',
                                    backgroundColor: 'var(--color-primary-50)',
                                },
                                popover: {
                                    styles: {
                                        body: {
                                            borderRadius: '16px',
                                        },
                                    },
                                },
                            }}
                        >
                            {data.assignments.map((ass) => (
                                <Avatar
                                    key={ass.user.id}
                                    src={optimizeCloudinary(ass.user.avatar)}
                                />
                            ))}
                        </Avatar.Group>
                    </div>
                )
            case 'income':
                return (
                    <p className="font-bold text-right text-currency">
                        {currencyFormatter(data.incomeCost)}
                    </p>
                )
            case 'status':
                return (
                    <JobStatusChip
                        data={data.status}
                        classNames={{
                            base: '!w-[120px]',
                            content:
                                'uppercase text-xs font-medium font-saira !w-[120px] text-nowrap line-clamp-1',
                        }}
                    />
                )
            case 'isPaid':
                return (
                    <PaidChip
                        status={data.isPaid ? 'paid' : 'unpaid'}
                        classNames={{
                            base: '!w-[100px]',
                            content: '!w-[100px] text-center',
                        }}
                    />
                )
            case 'dueAt':
                return (
                    <div className="flex items-center gap-1 text-text-subdued text-sm">
                        <CalendarIcon size={14} />
                        {dateFormatter(data.dueAt)}
                    </div>
                )
            case 'actions':
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <HeroTooltip content="View details">
                            <HeroButton
                                size="sm"
                                isIconOnly
                                variant="light"
                                color="default"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.editJob(data.no),
                                    })
                                }
                            >
                                <Eye size={16} />
                            </HeroButton>
                        </HeroTooltip>
                        <HeroTooltip content="Deliver status">
                            <HeroButton
                                size="sm"
                                isIconOnly
                                variant="light"
                                color="default"
                                onPress={() => {
                                    router.navigate({
                                        href:
                                            INTERNAL_URLS.editJob(data.no) +
                                            '?tab=deliveries',
                                    })
                                }}
                            >
                                <TruckElectricIcon size={16} />
                            </HeroButton>
                        </HeroTooltip>
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <HeroButton
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="default"
                                >
                                    <MoreVertical size={16} />
                                </HeroButton>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem
                                    key="staff_view"
                                    startContent={
                                        <SquareArrowOutUpRight size={16} />
                                    }
                                    onPress={() => {
                                        window.open(
                                            INTERNAL_URLS.getJobDetailUrl(
                                                data.no
                                            ),
                                            '_blank'
                                        )
                                    }}
                                >
                                    Open with Staff View
                                </DropdownItem>
                                <DropdownItem
                                    key="mark-done"
                                    startContent={<CheckCircle2 size={16} />}
                                >
                                    Mark Done
                                </DropdownItem>
                                <DropdownItem
                                    key="delete"
                                    startContent={<Trash2 size={16} />}
                                    className="text-danger"
                                    color="danger"
                                >
                                    Delete
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )
            default:
                // @ts-ignore
                return data[columnKey]
        }
    }, [])

    // --- Top Content ---
    const topContent = useMemo(() => {
        const selectedCount =
            selectedKeys === 'all' ? data.length : selectedKeys.size

        return (
            <div className="flex flex-col gap-4">
                {/* Filters & Search */}
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by job name, ID, or client..."
                        startContent={<Search className="text-default-300" />}
                        value={searchValue}
                        onClear={onClearSearch}
                        onValueChange={onSearchChange}
                        size="sm"
                        variant="bordered"
                    />
                    <div className="flex gap-3">
                        {/* TODO: Implement Status */}
                        {/* Status Dropdown */}
                        {false && (
                            <Dropdown>
                                <DropdownTrigger className="hidden sm:flex">
                                    <Button
                                        endContent={
                                            <ChevronDown className="text-small" />
                                        }
                                        variant="flat"
                                        size="sm"
                                    >
                                        Status
                                    </Button>
                                </DropdownTrigger>

                                <DropdownMenu
                                    disallowEmptySelection
                                    aria-label="Status Filter"
                                    closeOnSelect={false}
                                    selectedKeys={statusFilter}
                                    selectionMode="multiple"
                                    onSelectionChange={onStatusFilterChange}
                                >
                                    {jobStatuses.map((status) => (
                                        <DropdownItem
                                            key={status.code}
                                            className="capitalize"
                                        >
                                            {status.displayName}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        )}

                        {/* Priority Dropdown */}
                        {/* <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button
                                    endContent={
                                        <ChevronDown className="text-small" />
                                    }
                                    variant="flat"
                                    size="sm"
                                >
                                    Priority
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Priority Filter"
                                closeOnSelect={false}
                                selectedKeys={priorityFilter}
                                selectionMode="multiple"
                                onSelectionChange={setPriorityFilter}
                            >
                                {PRIORITY_OPTIONS.map((p) => (
                                    <DropdownItem
                                        key={p.uid}
                                        className="capitalize"
                                    >
                                        {p.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown> */}
                    </div>
                </div>

                {/* Bulk Action Bar */}
                {selectedCount > 0 && (
                    <div className="bg-primary-50 px-4 py-2 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm text-primary-700 font-medium">
                            {selectedCount} jobs selected
                        </span>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() => onBulkAction('STATUS')}
                            >
                                Update Status
                            </Button>
                            <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                startContent={<Trash2 size={16} />}
                                onPress={() => onBulkAction('DELETE')}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        )
    }, [searchValue, statusFilter, selectedKeys, data.length])

    // --- Bottom Content ---
    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === 'all'
                        ? 'All items selected'
                        : `${selectedKeys.size} of ${data.length} selected`}
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={pagination.page}
                    total={pagination.totalPages}
                    onChange={onPageChange}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button
                        isDisabled={(pagination.page || 1) === 1}
                        size="sm"
                        variant="flat"
                        onPress={() => onPageChange((pagination.page || 1) - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        isDisabled={
                            (pagination.page || 1) === pagination.totalPages
                        }
                        size="sm"
                        variant="flat"
                        onPress={() => onPageChange((pagination.page || 1) + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        )
    }, [selectedKeys, data.length, pagination])
    return (
        <HeroTable
            aria-label="Jobs Table"
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
                wrapper: 'max-h-[700px]',
            }}
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            topContent={topContent}
            topContentPlacement="outside"
            onSelectionChange={onSelectionChange}
            sortString={sort}
            onSortStringChange={onSortChange}
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn
                        key={column.uid}
                        align={column.uid === 'actions' ? 'center' : 'start'}
                        allowsSorting={column.sortable}
                    >
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody
                emptyContent={'No jobs found'}
                items={data} // Use Server Data
                isLoading={isLoadingData} // Show loading state
            >
                {(item: TJob) => (
                    <TableRow key={item.id}>
                        {(columnKey) => (
                            <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </HeroTable>
    )
}
