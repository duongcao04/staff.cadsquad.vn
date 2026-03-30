import {
    Button,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Pagination,
    Select,
    Selection,
    SelectItem,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Avatar } from 'antd'
import { debounce } from 'lodash'
import {
    CheckCircle2,
    Eye,
    MoreVertical,
    RefreshCw,
    SearchIcon,
    SquareArrowOutUpRight,
    Trash2,
    TruckElectricIcon,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import dayjs from 'dayjs'
import {
    currencyFormatter,
    INTERNAL_URLS,
    optimizeCloudinary,
    RouteUtil,
} from '../../../../lib'
import { jobStatusesListOptions } from '../../../../lib/queries'
import { TManageJobsParams } from '../../../../routes/_administrator/mgmt/jobs'
import JobFinishChip from '../../../../shared/components/chips/JobFinishChip'
import { JobStatusChip } from '../../../../shared/components/chips/JobStatusChip'
import { PaidChip } from '../../../../shared/components/chips/PaidChip'
import CountdownTimer from '../../../../shared/components/ui/countdown-timer'
import { HeroButton } from '../../../../shared/components/ui/hero-button'
import { HeroTable } from '../../../../shared/components/ui/hero-table'
import { HeroTooltip } from '../../../../shared/components/ui/hero-tooltip'
import { JobStatusSystemTypeEnum } from '../../../../shared/enums'
import { TJob } from '../../../../shared/types'
import { HeroCopyButton } from '../../../../shared/components'

const columns = [
    { name: 'Job no', uid: 'no', sortable: false },
    { name: 'Job', uid: 'info', sortable: false },
    { name: 'Client', uid: 'clientName', sortable: false },
    { name: 'Income', uid: 'income', sortable: false },
    { name: 'Total Staff Cost', uid: 'totalStaffCost', sortable: false },
    { name: 'Status', uid: 'status', sortable: false },
    { name: 'Due on', uid: 'dueAt', sortable: false },
    { name: 'Assignee', uid: 'assignee' },
    { name: 'Payment', uid: 'isPaid', sortable: false },
    { name: 'Actions', uid: 'actions' },
]

export const getDueInPresets = () => {
    const now = dayjs()
    return [
        {
            key: 'lt_1_week',
            label: '< 1 week',
            from: now,
            to: now.add(1, 'week'),
            dateStr: `${now.format('D MMM')} - ${now.add(1, 'week').format('D MMM, YYYY')}`,
        },
        {
            key: 'lt_2_weeks',
            label: '< 2 weeks',
            from: now,
            to: now.add(2, 'weeks'),
            dateStr: `${now.format('D MMM')} - ${now.add(2, 'weeks').format('D MMM, YYYY')}`,
        },
        {
            key: 'lt_3_weeks',
            label: '< 3 weeks',
            from: now,
            to: now.add(3, 'weeks'),
            dateStr: `${now.format('D MMM')} - ${now.add(3, 'weeks').format('D MMM, YYYY')}`,
        },
        {
            key: 'lt_1_month',
            label: '< 1 month',
            from: now,
            to: now.add(1, 'month'),
            dateStr: `${now.format('D MMM')} - ${now.add(1, 'month').format('D MMM, YYYY')}`,
        },
        {
            key: 'gt_1_month',
            label: '> 1 month',
            from: now.add(1, 'month').add(1, 'day'), // Starts after the 1-month mark
            to: null, // Indefinite future
            dateStr: `After ${now.add(1, 'month').format('D MMM, YYYY')}`,
        },
    ] as const
}

type Pagination = {
    page: number
    totalPages: number
    limit: number
}
type JobManagementTableProps = {
    data: TJob[]
    isLoadingData: boolean
    selectedKeys: Selection
    sort: string
    pagination: Pagination
    statusFilter: Selection
    onSelectionChange: (keys: Selection) => void
    onBulkAction: (type: 'DELETE' | 'STATUS') => void
    searchParams: TManageJobsParams
}
export function JobManagementTable({
    data,
    pagination,
    isLoadingData,
    selectedKeys,
    statusFilter,
    sort,
    onSelectionChange,
    searchParams,
}: JobManagementTableProps) {
    const router = useRouter()
    const { search: searchValue } = searchParams

    const inputRef = useRef<HTMLInputElement>(null)

    const dueInPresets = getDueInPresets()

    const {
        data: { jobStatuses },
    } = useSuspenseQuery({
        ...jobStatusesListOptions(),
    })

    // 1. Thêm Local State để UI phản hồi chữ ngay lập tức khi user gõ
    const [inputValue, setInputValue] = useState(searchValue || '')

    // 2. Đồng bộ inputValue nếu `searchValue` từ URL thay đổi (VD: user click nút back/forward)
    useEffect(() => {
        setInputValue(searchValue || '')
    }, [searchValue])

    // 3. Khởi tạo hàm thực thi debounce update URL
    const debounceSearch = useMemo(
        () =>
            debounce((value?: string) => {
                RouteUtil.updateParams({
                    search: value || undefined,
                    page: 1,
                })
                setTimeout(() => {
                    inputRef.current?.focus()
                }, 50)
            }, 500),
        []
    )

    // 4. Dọn dẹp (cleanup) khi component unmount
    useEffect(() => {
        return () => debounceSearch.cancel()
    }, [debounceSearch])

    // 5. Hàm xử lý thay đổi text
    const handleInputChange = (val: string) => {
        setInputValue(val)
        debounceSearch(val)
    }

    // 6. Hàm xử lý clear text
    const handleClear = () => {
        setInputValue('')
        debounceSearch.cancel()
        RouteUtil.updateParams({ search: undefined, page: 1 })
    }

    // --- Render Cell ---
    const renderCell = useCallback(
        (data: TJob, columnKey: React.Key) => {
            switch (columnKey) {
                case 'no':
                    return (
                        <div className="flex items-center justify-between gap-2 group size-full">
                            <span className="uppercase select-text cursor-text">
                                {data.no}
                            </span>
                            <HeroTooltip content="Copy">
                                <HeroCopyButton
                                    textValue={data.no}
                                    className="opacity-70!"
                                />
                            </HeroTooltip>
                        </div>
                    )
                case 'info':
                    return (
                        <div>
                            <p className="font-bold text-text-default">
                                {data.displayName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-mono bg-background-hovered text-text-subdued px-1 py-0.5 rounded">
                                    {data.type.displayName}
                                </span>
                            </div>
                        </div>
                    )
                case 'clientName':
                    return <p className="line-clamp-1">{data.client?.name}</p>
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
                                        backgroundColor:
                                            'var(--color-primary-50)',
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
                                        src={optimizeCloudinary(
                                            ass.user.avatar
                                        )}
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
                case 'totalStaffCost':
                    return (
                        <p className="font-bold text-right text-currency">
                            {currencyFormatter(
                                data.totalStaffCost,
                                'Vietnamese'
                            )}
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

                case 'dueAt': {
                    const isCompleted =
                        data.status.systemType ===
                        JobStatusSystemTypeEnum.COMPLETED
                    const isFinish =
                        data.status.systemType ===
                        JobStatusSystemTypeEnum.TERMINATED
                    const isPaused = isCompleted || isFinish

                    return (
                        <div className="w-full">
                            {isPaused ? (
                                <JobFinishChip
                                    status={
                                        isCompleted ? 'completed' : 'finish'
                                    }
                                />
                            ) : (
                                <CountdownTimer
                                    targetDate={dayjs(data.dueAt)}
                                    hiddenUnits={['second', 'year']}
                                    paused={isPaused}
                                    className="text-right!"
                                />
                            )}
                        </div>
                    )
                }
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
                                            href: INTERNAL_URLS.management.jobDetail(
                                                data.no
                                            ),
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
                                                INTERNAL_URLS.management.jobDetail(
                                                    data.no
                                                ) + '?tab=deliveries',
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
                                                INTERNAL_URLS.jobDetail(
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
                                        startContent={
                                            <CheckCircle2 size={16} />
                                        }
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
        },
        [router]
    )

    // --- Top Content ---
    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                {/* Filters & Search */}
                <div className="flex justify-between gap-3 items-end">
                    <div className="flex gap-3 items-center">
                        <Input
                            isClearable
                            ref={inputRef}
                            classNames={{
                                base: 'w-[450px]',
                                mainWrapper: 'w-[450px]',
                                inputWrapper:
                                    'hover:shadow-SM bg-background border-border-default border',
                            }}
                            variant="bordered"
                            size="sm"
                            placeholder="Search by name..."
                            startContent={
                                <div className="w-4 flex items-center justify-center">
                                    <SearchIcon
                                        className="text-small text-text-6"
                                        size={14}
                                    />
                                </div>
                            }
                            value={inputValue}
                            onClear={handleClear}
                            onValueChange={handleInputChange}
                        />

                        <Divider orientation="vertical" className="h-5" />

                        <Button
                            startContent={
                                <RefreshCw
                                    size={14}
                                    className={`text-small ${isLoadingData ? 'animate-spin-smooth' : ''}`}
                                />
                            }
                            className="border-1"
                            variant="bordered"
                            size="sm"
                        >
                            Refresh
                        </Button>
                    </div>

                    <div className="flex gap-3 items-center">
                        <Select
                            selectionMode="multiple"
                            className="min-w-34"
                            size="sm"
                            classNames={{
                                trigger:
                                    'hover:shadow-SM border-border-default border cursor-pointer',
                                popoverContent: 'w-[200px]!',
                            }}
                            placeholder="Status"
                            isClearable
                            onClear={() =>
                                RouteUtil.updateParams({
                                    status: undefined,
                                    page: 1,
                                })
                            }
                            onSelectionChange={(value) =>
                                RouteUtil.updateParams({
                                    status: Array.from(value).join(','),
                                    page: 1,
                                })
                            }
                            renderValue={(items) => (
                                <p className="text-text-7">
                                    {items.length} status
                                    {items.length > 1 ? 'es' : ''}
                                </p>
                            )}
                        >
                            {jobStatuses.map((js) => (
                                <SelectItem key={js.code}>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="size-2 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    js.hexColor || '#000',
                                            }}
                                        />
                                        <p>{js.displayName}</p>
                                    </div>
                                </SelectItem>
                            ))}
                        </Select>

                        {/* Due Date Filter */}
                        <Select
                            className="min-w-34"
                            size="sm"
                            classNames={{
                                trigger:
                                    'hover:shadow-SM border-border-default border cursor-pointer',
                                popoverContent: 'w-[200px]!',
                            }}
                            placeholder="Due in"
                            isClearable
                            onSelectionChange={(value) => {
                                if (!value.currentKey) {
                                    RouteUtil.updateParams({
                                        dueIn: undefined,
                                        page: 1,
                                    })
                                } else {
                                    RouteUtil.updateParams({
                                        dueIn: value.currentKey,
                                        page: 1,
                                    })
                                }
                            }}
                            renderValue={(items) => (
                                <p className="text-text-7">
                                    {items[0]?.textValue}
                                </p>
                            )}
                        >
                            {dueInPresets.map((d) => (
                                <SelectItem key={d.key}>{d.label}</SelectItem>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>
        )
    }, [
        inputValue,
        statusFilter,
        selectedKeys,
        data.length,
        jobStatuses,
        isLoadingData,
    ]) // Add inputValue & isLoadingData

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
                    onChange={(page) =>
                        RouteUtil.updateParams<TManageJobsParams>({
                            page: page,
                        })
                    }
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button
                        isDisabled={(pagination.page || 1) === 1}
                        size="sm"
                        variant="flat"
                        onPress={() =>
                            RouteUtil.updateParams({
                                page: (pagination.page || 1) - 1, // FIX math precedence
                            })
                        }
                    >
                        Previous
                    </Button>
                    <Button
                        isDisabled={
                            (pagination.page || 1) === pagination.totalPages
                        }
                        size="sm"
                        variant="flat"
                        onPress={() =>
                            RouteUtil.updateParams({
                                page: (pagination.page || 1) + 1, // FIX math precedence
                            })
                        }
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
            onSortStringChange={(value) =>
                RouteUtil.updateParams({
                    sort: value,
                    page: 1,
                })
            }
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
                items={data}
                isLoading={isLoadingData}
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
