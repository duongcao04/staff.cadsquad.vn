import { pCenterTableStore } from '@/features/project-center'
import { optimizeCloudinary, useProfile } from '@/lib'
import { dateFormatter } from '@/lib/dayjs'
import { useJobStatuses } from '@/lib/queries'
import {
    currencyFormatter,
    DUE_DATE_PRESETS,
    getAllowedJobColumns,
    getDueDateRange,
    INTERNAL_URLS,
    TABLE_ROW_PER_PAGE_OPTIONS,
} from '@/lib/utils'
import { TJobFilters } from '@/lib/validationSchemas'
import {
    HeroButton,
    HeroSelect,
    HeroSelectItem,
    HeroTable,
    HeroTableBody,
    HeroTableCell,
    HeroTableColumn,
    HeroTableHeader,
    HeroTableRow,
    HeroTooltip,
} from '@/shared/components'
import JobFinishChip from '@/shared/components/chips/JobFinishChip'
import JobStatusDropdown from '@/shared/components/dropdowns/JobStatusDropdown'
import PaymentStatusDropdown from '@/shared/components/dropdowns/PaymentStatusDropdown'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import HeroCopyButton from '@/shared/components/ui/hero-copy-button'
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import type { JobColumnKey, TJob, TJobStatus } from '@/shared/types'
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Input,
    Pagination,
    Select,
    type Selection,
    SelectItem,
    Spinner,
    Switch,
} from '@heroui/react'
import { useStore } from '@tanstack/react-store'
import { Avatar, Image } from 'antd'
import dayjs from 'dayjs'
import lodash from 'lodash'
import {
    Check,
    ChevronDownIcon,
    Columns3Cog,
    EllipsisVertical,
    EyeClosed,
    EyeIcon,
    FilePlus,
    RefreshCw,
    SearchIcon,
    Sheet,
    SquareChartGantt,
    SquareKanban,
    UserRoundPlus,
    X,
} from 'lucide-react'
import { ReactNode, useCallback, useMemo } from 'react'
import { FilterBuilder } from '../dropdowns/FilterDropdown'
import ProjectCenterTableBulkActions from '../dropdowns/ProjectCenterTableBulkActions'
import { ProjectCenterTableQuickActions } from '../dropdowns/ProjectCenterTableQuickActions'

type ProjectCenterTableProps = {
    data: TJob[]
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
    onSortChange: (s?: string) => void
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
export default function ProjectCenterTable({
    data,
    isLoadingData = false,
    visibleColumns,
    sort,
    searchKeywords,
    pagination,
    filters,
    showFinishItems,
    onRefresh,
    onSearchKeywordsChange,
    onFiltersChange,
    onSortChange,
    onDownloadCsv,
    onShowFinishItemsChange,
    openViewColDrawer,
    openJobDetailDrawer,
    onAssignMember,
    onLimitChange,
    onPageChange,
    onAddAttachments,
}: ProjectCenterTableProps) {
    const { userRole, userPermissions } = useProfile()
    const { data: jobStatuses } = useJobStatuses()

    const hasSearchFilter = Boolean(searchKeywords)

    const setContextItem = (value: TJob | null) => {
        return pCenterTableStore.setState((state) => ({
            ...state,
            contextItem: value,
        }))
    }
    const selectedKeys = useStore(
        pCenterTableStore,
        (state) => state.selectedKeys
    )
    const setSelectedKeys = (keys: Selection) => {
        pCenterTableStore.setState((state) => ({
            ...state,
            selectedKeys:
                keys === 'all' ? 'all' : new Set(keys as unknown as string[]),
        }))
    }

    // Role-based header logic
    const headerColumns = useMemo(
        () => getAllowedJobColumns(visibleColumns, userPermissions),
        [visibleColumns, userRole]
    )

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const topContent = useMemo(() => {
        return (
            <div className="w-full flex flex-col gap-4">
                <div className="w-full flex justify-between gap-3 items-end">
                    <div className="flex items-center justify-start gap-2">
                        <Input
                            isClearable
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
                            value={searchKeywords}
                            onClear={() => onSearchKeywordsChange('')}
                            onValueChange={(value) =>
                                onSearchKeywordsChange(value)
                            }
                        />

                        <div className="w-px mx-3 h-5 bg-text-muted"></div>
                        <div className="flex gap-3">
                            <Button
                                startContent={
                                    <RefreshCw
                                        size={14}
                                        className={`text-small ${
                                            isLoadingData
                                                ? 'animate-spin-smooth'
                                                : ''
                                        }`}
                                    />
                                }
                                className="border-1"
                                variant="bordered"
                                size="sm"
                                onPress={onRefresh}
                            >
                                <span className="font-medium">Refresh</span>
                            </Button>

                            <FilterBuilder
                                defaultFilters={filters}
                                onApply={onFiltersChange}
                                className="border-1"
                            />

                            <Dropdown placement="bottom-start">
                                <DropdownTrigger className="hidden sm:flex">
                                    <Button
                                        endContent={
                                            <ChevronDownIcon
                                                className="text-small"
                                                size={14}
                                            />
                                        }
                                        variant="bordered"
                                        size="sm"
                                        className="border-1"
                                    >
                                        <span className="font-medium">
                                            View
                                        </span>
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    disallowEmptySelection
                                    aria-label="Table Columns"
                                    closeOnSelect={false}
                                    disabledKeys={
                                        new Set(['gantt_view', 'kanban_view'])
                                    }
                                    selectedKeys={new Set(['table_view'])}
                                    // onSelectionChange={setVisibleColumns}
                                >
                                    <DropdownItem
                                        key="gantt_view"
                                        startContent={
                                            <SquareChartGantt
                                                size={14}
                                                className="text-text-default"
                                            />
                                        }
                                    >
                                        Gantt
                                    </DropdownItem>
                                    <DropdownItem
                                        key="kanban_view"
                                        startContent={
                                            <SquareKanban
                                                size={14}
                                                className="text-text-default"
                                            />
                                        }
                                    >
                                        Kanban
                                    </DropdownItem>
                                    <DropdownItem
                                        key="table_view"
                                        startContent={
                                            <Sheet
                                                size={14}
                                                className="text-text-default"
                                            />
                                        }
                                    >
                                        Table
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>

                            <Dropdown
                                placement="bottom-end"
                                showArrow
                                style={{
                                    width: 300,
                                }}
                            >
                                <DropdownTrigger>
                                    <Button
                                        variant="bordered"
                                        size="sm"
                                        isIconOnly
                                        className="border-1"
                                    >
                                        <EllipsisVertical
                                            className="text-small"
                                            size={14}
                                        />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    disallowEmptySelection
                                    aria-label="View settings dropdown"
                                >
                                    <DropdownSection title="View settings">
                                        <DropdownItem
                                            key="switch"
                                            isReadOnly
                                            classNames={{
                                                base: 'hover:!bg-background cursor-default',
                                            }}
                                            startContent={
                                                <EyeClosed
                                                    size={16}
                                                    className="text-text-default"
                                                />
                                            }
                                        >
                                            <div className="w-full flex items-center justify-between gap-3">
                                                <p>Hide finish items</p>
                                                {isLoadingData ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    <Switch
                                                        isSelected={
                                                            showFinishItems
                                                        }
                                                        size="sm"
                                                        aria-label="Hide finish items"
                                                        endContent={<X />}
                                                        startContent={<Check />}
                                                        color="success"
                                                        onValueChange={
                                                            onShowFinishItemsChange
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </DropdownItem>
                                        <DropdownItem
                                            key="columns"
                                            startContent={
                                                <Columns3Cog
                                                    size={16}
                                                    className="text-text-default"
                                                />
                                            }
                                            onPress={openViewColDrawer}
                                        >
                                            View columns
                                        </DropdownItem>
                                    </DropdownSection>
                                </DropdownMenu>
                            </Dropdown>
                        </div>

                        <div className="w-px mx-3 h-5 bg-text-muted"></div>

                        <div className="flex gap-3">
                            <HeroSelect
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
                                onClear={() => {
                                    onFiltersChange({
                                        ...filters,
                                        status: undefined,
                                    })
                                }}
                                onSelectionChange={(value) => {
                                    const arrayToString =
                                        Array.from(value).join(',')
                                    onFiltersChange?.({
                                        ...filters,
                                        status: arrayToString,
                                    })
                                }}
                                renderValue={(selectedItems) => {
                                    return (
                                        <p className="text-text-7">
                                            {selectedItems.length} status
                                            {selectedItems.length > 1
                                                ? 'es'
                                                : ''}
                                        </p>
                                    )
                                }}
                            >
                                {jobStatuses.map((jobStatus) => {
                                    return (
                                        <HeroSelectItem key={jobStatus.code}>
                                            <div className="flex items-center justify-start gap-2">
                                                <div
                                                    className="size-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            jobStatus.hexColor
                                                                ? jobStatus.hexColor
                                                                : '#000000',
                                                    }}
                                                />
                                                <p>{jobStatus.displayName}</p>
                                            </div>
                                        </HeroSelectItem>
                                    )
                                })}
                            </HeroSelect>

                            <HeroSelect
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
                                    const { dueAtFrom, dueAtTo } =
                                        getDueDateRange(value.currentKey)
                                    onFiltersChange?.({
                                        ...filters,
                                        dueAtFrom: dueAtFrom?.split('T')[0],
                                        dueAtTo: dueAtTo?.split('T')[0],
                                    })
                                }}
                                renderValue={(selectedItems) => {
                                    return (
                                        <p className="text-text-7">
                                            {selectedItems[0]?.textValue}
                                        </p>
                                    )
                                }}
                            >
                                {DUE_DATE_PRESETS.map((dueIn) => {
                                    return (
                                        <HeroSelectItem key={dueIn.key}>
                                            {dueIn.label}
                                        </HeroSelectItem>
                                    )
                                })}
                            </HeroSelect>
                        </div>

                        <div className="w-px mx-3 h-5 bg-text-muted"></div>
                        {(selectedKeys === 'all' || selectedKeys.size > 0) && (
                            <div className="flex items-center justify-start gap-3">
                                <p className="text-sm">
                                    {selectedKeys === 'all'
                                        ? 'All items selected'
                                        : `${selectedKeys.size} selected`}
                                </p>
                                <ProjectCenterTableBulkActions
                                    keys={selectedKeys}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <Button
                            startContent={
                                <Sheet className="text-small" size={14} />
                            }
                            variant="flat"
                            size="sm"
                            className="shadow-SM"
                            onPress={onDownloadCsv}
                        >
                            <span className="font-medium">
                                Download as .csv
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }, [
        visibleColumns,
        data?.length,
        filters,
        hasSearchFilter,
        selectedKeys,
        showFinishItems,
        isLoadingData,
        searchKeywords,
    ])

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 grid grid-cols-3 gap-5">
                <Select
                    className="w-40"
                    label="Rows per page"
                    variant="bordered"
                    classNames={{
                        trigger: 'shadow-SM',
                    }}
                    size="sm"
                    selectionMode="single"
                    defaultSelectedKeys={[pagination.limit.toString()]}
                    onSelectionChange={(keys) => {
                        onLimitChange(Number(keys.currentKey))
                    }}
                >
                    {TABLE_ROW_PER_PAGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value}>
                            {opt.displayName}
                        </SelectItem>
                    ))}
                </Select>
                <div className="flex items-center justify-center">
                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={pagination.page}
                        total={pagination.totalPages}
                        onChange={onPageChange}
                    />
                </div>
                <div className="hidden sm:flex w-[30%] justify-end gap-2"></div>
            </div>
        )
    }, [selectedKeys, data?.length, pagination, hasSearchFilter])

    const renderCell: (data: TJob, columnKey: JobColumnKey) => ReactNode =
        // eslint-disable-next-line react-hooks/preserve-manual-memoization
        useCallback((data: TJob, columnKey: JobColumnKey) => {
            const cellValue = lodash.has(data, columnKey)
                ? (data[columnKey] as string)
                : ''

            switch (columnKey) {
                case 'thumbnailUrl':
                    return (
                        <div className="flex items-center justify-center">
                            <div className="overflow-hidden rounded-full size-10">
                                <Image
                                    src={data.status.thumbnailUrl}
                                    alt="image"
                                    className="object-cover rounded-full size-full"
                                    preview={false}
                                />
                            </div>
                        </div>
                    )
                case 'clientName':
                    return (
                        <p className="line-clamp-1">
                            {data.client?.name || 'Unknown client'}
                        </p>
                    )
                case 'type':
                    return (
                        <p className="line-clamp-1">{data.type.displayName}</p>
                    )
                case 'no':
                    return (
                        <div className="flex items-center justify-between gap-2 group size-full">
                            <span className="uppercase">{data.no}</span>
                            <HeroTooltip content="Copy">
                                <HeroCopyButton
                                    textValue={data.no}
                                    className="opacity-70!"
                                />
                            </HeroTooltip>
                        </div>
                    )
                case 'displayName':
                    return (
                        <p className="w-62.5 line-clamp-1 font-medium">
                            {data.displayName}
                        </p>
                    )
                case 'incomeCost':
                    return (
                        <p className="font-bold text-right text-currency">
                            {currencyFormatter(data.incomeCost)}
                        </p>
                    )
                case 'totalStaffCost': // Total cost for Admin
                    return (
                        <p className="font-bold text-right text-currency">
                            {currencyFormatter(
                                data.totalStaffCost,
                                'Vietnamese'
                            )}
                        </p>
                    )

                case 'staffCost': // Individual cost for User
                    return (
                        <>
                            {data.staffCost ? (
                                <p className="font-bold text-right text-currency">
                                    {currencyFormatter(
                                        data.staffCost,
                                        'Vietnamese'
                                    )}
                                </p>
                            ) : (
                                <p className="text-xs italic text-text-subdued text-right">
                                    Not assigned
                                </p>
                            )}
                        </>
                    )
                case 'status':
                    return (
                        <div className="flex items-center justify-center z-0">
                            <JobStatusDropdown
                                jobData={data}
                                statusData={data.status as TJobStatus}
                                afterChangeStatus={onRefresh}
                            />
                        </div>
                    )
                case 'dueAt': {
                    const isCompleted =
                        data.status.systemType ===
                        JobStatusSystemTypeEnum.COMPLETED
                    const isFinish =
                        data.status.systemType ===
                        JobStatusSystemTypeEnum.TERMINATED

                    const isPaused = isCompleted || isFinish
                    const targetDate = dayjs(data.dueAt)

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
                                    targetDate={targetDate}
                                    hiddenUnits={['second', 'year']}
                                    paused={isPaused}
                                    className="text-right!"
                                />
                            )}
                        </div>
                    )
                }
                case 'attachmentUrls':
                    return !data.attachmentUrls?.length ? (
                        <div className="size-full flex items-center justify-center">
                            <HeroTooltip content={'Add attachment'}>
                                <HeroButton
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    className="size-8! flex items-center justify-center"
                                    onPress={() => onAddAttachments(data.no)}
                                    color="default"
                                >
                                    <p className="inline-flex items-center leading-none">
                                        <FilePlus
                                            size={16}
                                            className="opacity-60"
                                        />
                                    </p>
                                </HeroButton>
                            </HeroTooltip>
                        </div>
                    ) : (
                        <p className="w-full text-center font-semibold tracking-wide">
                            x{data.attachmentUrls.length}
                        </p>
                    )
                case 'assignments':
                    return !data.assignments.length ? (
                        <div className="size-full flex items-center justify-center">
                            <HeroTooltip content="Assign members">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    className="size-8! flex items-center justify-center"
                                    onPress={() => onAssignMember(data.no)}
                                >
                                    <UserRoundPlus
                                        size={16}
                                        className="opacity-60"
                                    />
                                </Button>
                            </HeroTooltip>
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
                                        key={ass.id}
                                        src={optimizeCloudinary(
                                            ass.user.avatar
                                        )}
                                    />
                                ))}
                            </Avatar.Group>
                        </div>
                    )
                case 'isPaid':
                    return <PaymentStatusDropdown jobData={data} />
                case 'paymentChannel':
                    return data.paymentChannel ? (
                        <p className="line-clamp-1">
                            {data.paymentChannel.displayName}
                        </p>
                    ) : (
                        <p>-</p>
                    )
                case 'completedAt':
                    return (
                        data.completedAt && (
                            <span>{dateFormatter(data.completedAt)}</span>
                        )
                    )
                case 'createdAt':
                    return data.createdAt ? (
                        <span>{dateFormatter(data.createdAt)}</span>
                    ) : (
                        <span className="text-text-subdued">-</span>
                    )
                case 'updatedAt':
                    return data.updatedAt ? (
                        <span>{dateFormatter(data.updatedAt)}</span>
                    ) : (
                        <span className="text-text-subdued">-</span>
                    )

                case 'action':
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <HeroTooltip content="View details">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    className="size-8! flex items-center justify-center"
                                    onPress={() => {
                                        openJobDetailDrawer(data.no)
                                    }}
                                >
                                    <p className="inline-flex items-center leading-none">
                                        <EyeIcon
                                            size={18}
                                            className="opacity-60"
                                        />
                                    </p>
                                </Button>
                            </HeroTooltip>
                            <HeroTooltip content="Copy link">
                                <HeroCopyButton
                                    className="size-8! flex items-center justify-center"
                                    iconSize={16}
                                    iconClassName="opacity-60"
                                    textValue={INTERNAL_URLS.getJobDetailUrl(
                                        data.no
                                    )}
                                />
                            </HeroTooltip>
                            <ProjectCenterTableQuickActions data={data} />
                        </div>
                    )
                default:
                    return cellValue
            }
        }, [])

    return (
        <HeroTable
            key="no"
            isHeaderSticky
            aria-label="Project center table"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            topContent={topContent}
            sortString={sort ?? undefined}
            onSortStringChange={onSortChange}
            BaseComponent={(found) => {
                return (
                    <ScrollArea className="size-full h-full! border border-border p-2 rounded-md min-h-[calc(100%-150px)]">
                        <ScrollBar orientation="horizontal" />
                        <ScrollBar orientation="vertical" />
                        {found.children}
                    </ScrollArea>
                )
            }}
            // sortDescriptor={sortDescriptor}
            topContentPlacement="outside"
            onSelectionChange={setSelectedKeys}
            // onSortChange={setSortDescriptor}'
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
                        onContextMenu={() => {
                            setContextItem(null)
                        }}
                    >
                        {column.displayName}
                    </HeroTableColumn>
                )}
            </HeroTableHeader>
            <HeroTableBody
                emptyContent={'No items found'}
                items={isLoadingData ? [] : data}
                loadingContent={<TableLoadingFallback />}
                isLoading={isLoadingData}
            >
                {(item) => (
                    <HeroTableRow
                        key={item.id}
                        onContextMenu={() => {
                            setContextItem(item)
                        }}
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

function TableLoadingFallback() {
    return (
        <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-content1/50">
            <Spinner size="lg" color="primary" label="Loading data..." />
        </div>
    )
}
