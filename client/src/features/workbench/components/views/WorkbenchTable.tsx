import { useProfile } from '@/lib'
import { optimizeCloudinary } from '@/lib/cloudinary'
import { jobStatusesListOptions } from '@/lib/queries'
import {
    APP_PERMISSIONS,
    currencyFormatter,
    DUE_DATE_PRESETS,
    getAllowedJobColumns,
    getDueDateRange,
    IMAGES,
    TABLE_ROW_PER_PAGE_OPTIONS,
} from '@/lib/utils'
import { TJobFilters } from '@/lib/validationSchemas'
import {
    HeroSelect,
    HeroSelectItem,
    HeroTable,
    HeroTableBody,
    HeroTableCell,
    HeroTableColumn,
    HeroTableHeader,
    HeroTableRow,
    HeroTooltip,
    PaidChip,
} from '@/shared/components'
import JobFinishChip from '@/shared/components/chips/JobFinishChip'
import JobStatusDropdown from '@/shared/components/dropdowns/JobStatusDropdown'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import HeroCopyButton from '@/shared/components/ui/hero-copy-button'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { IPaginate } from '@/shared/interfaces'
import { pCenterTableStore } from '@/features/project-center'
import { JobColumnKey, TJob } from '@/shared/types'
import {
    Button,
    Input,
    Pagination,
    Select,
    Selection,
    SelectItem,
    Spinner,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { Avatar, Image } from 'antd'
import dayjs from 'dayjs'
import lodash from 'lodash'
import {
    EyeIcon,
    PinIcon,
    RefreshCwIcon,
    SearchIcon,
    UserRoundPlus,
} from 'lucide-react'
import { ReactNode, useCallback, useMemo } from 'react'
import { WorkbenchTableQuickActions } from '../modals/WorkbenchTableQuickActions'

type Props = {
    pagination: IPaginate
    sort: string
    search?: string
    filters: TJobFilters
    onRefresh: () => void
    onSearchChange: (newSearch?: string) => void
    onPageChange: (newPage: number) => void
    onSortChange: (newSort: string) => void
    onLimitChange: (newLimit: number) => void
    onViewDetail: (jobNo: string) => void
    onAssignMember: (jobNo: string) => void
    onFiltersChange: (newFilters: TJobFilters) => void
    isLoadingData: boolean
    data: TJob[]
}
export default function WorkbenchTable({
    isLoadingData = false,
    data,
    sort,
    search,
    filters,
    onViewDetail,
    onSearchChange,
    onSortChange,
    onAssignMember,
    onRefresh,
    onPageChange,
    onFiltersChange,
    pagination,
    onLimitChange,
}: Props) {
    const {
        data: { jobStatuses },
    } = useSuspenseQuery({
        ...jobStatusesListOptions(),
    })

    const { userPermissions } = useProfile()

    const showJobSentitive = userPermissions.includes(
        APP_PERMISSIONS.JOB.READ_SENSITIVE
    )

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

    // 1. Centralized Header Logic using Security Helper
    const headerColumns = useMemo(() => {
        // Filter master list by role permissions
        const allowed = getAllowedJobColumns('all', userPermissions)
        // Define specific set for Workbench view
        const workbenchUids = [
            'thumbnailUrl',
            'no',
            'displayName',
            showJobSentitive ? 'totalStaffCost' : 'staffCost', // Role-based dynamic UID
            'assignments',
            'isPaid',
            'dueAt',
            'status',
            'action',
        ]

        return allowed.filter((col) => workbenchUids.includes(col.uid))
    }, [userPermissions])

    const topContent = useMemo(() => {
        return (
            <div className="flex items-center justify-start gap-2 mb-5">
                <Input
                    isClearable
                    classNames={{
                        base: 'w-[450px]',
                        mainWrapper: 'w-[450px]',
                        inputWrapper:
                            'hover:shadow-SM bg-background border-border-default border-1',
                    }}
                    variant="bordered"
                    size="sm"
                    placeholder="Search by job no, job name..."
                    startContent={
                        <SearchIcon className="text-text-6" size={14} />
                    }
                    value={search}
                    onClear={() => onSearchChange(undefined)}
                    onValueChange={(value) => onSearchChange(value)}
                />
                <div className="w-px mx-3 h-5 bg-text-muted"></div>
                <Button
                    startContent={
                        <RefreshCwIcon
                            size={14}
                            className={`text-small ${
                                isLoadingData ? 'animate-spin-smooth' : ''
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
                            const arrayToString = Array.from(value).join(',')
                            onFiltersChange?.({
                                ...filters,
                                status: arrayToString,
                            })
                        }}
                        renderValue={(selectedItems) => {
                            return (
                                <p className="text-text-7">
                                    {selectedItems.length} status
                                    {selectedItems.length > 1 ? 'es' : ''}
                                </p>
                            )
                        }}
                    >
                        {jobStatuses
                            .filter((it) => it.systemType !== 'TERMINATED')
                            .map((jobStatus) => {
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
                            console.log(value.currentKey)
                            const { dueAtFrom, dueAtTo } = getDueDateRange(
                                value.currentKey
                            )
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
            </div>
        )
    }, [search, onRefresh, onSearchChange, isLoadingData])

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <Select
                    className="w-40"
                    label="Rows per page"
                    variant="bordered"
                    size="sm"
                    selectedKeys={[pagination.limit.toString()]}
                    onSelectionChange={(keys) =>
                        onLimitChange(Number(Array.from(keys)[0]))
                    }
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
                    onChange={onPageChange}
                />
                <div className="w-40" />
            </div>
        )
    }, [pagination, onPageChange, onLimitChange])

    // 2. Cell Rendering Logic
    const renderCell = useCallback(
        (item: TJob, columnKey: JobColumnKey): ReactNode => {
            const cellValue = lodash.get(item, columnKey, '')

            switch (columnKey) {
                case 'thumbnailUrl':
                    return (
                        <div className="flex items-center justify-center">
                            <div className="overflow-hidden rounded-full size-10 border border-border">
                                <Image
                                    src={
                                        item.status.thumbnailUrl
                                            ? optimizeCloudinary(
                                                  item.status.thumbnailUrl,
                                                  { width: 80, height: 80 }
                                              )
                                            : IMAGES.loadingPlaceholder
                                    }
                                    alt="thumb"
                                    className="object-cover size-full"
                                    preview={false}
                                />
                            </div>
                        </div>
                    )
                case 'no':
                    return (
                        <div className="flex items-center justify-between gap-2 group w-full">
                            <span className="uppercase font-mono text-xs">
                                {item.no}
                            </span>
                            <HeroCopyButton
                                textValue={item.no}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                        </div>
                    )
                case 'displayName':
                    return (
                        <div className="flex items-center gap-2">
                            <p className="line-clamp-1 font-medium">
                                {item.displayName}
                            </p>
                            {item.isPinned && (
                                <PinIcon
                                    className="text-primary fill-primary"
                                    size={12}
                                />
                            )}
                        </div>
                    )
                case 'totalStaffCost':
                case 'staffCost': {
                    // Determine value based on role vs dynamic column key
                    const cost = showJobSentitive
                        ? item.totalStaffCost
                        : item.staffCost
                    return (
                        <p className="font-bold text-right text-primary">
                            {currencyFormatter(cost ?? 0, 'Vietnamese')}
                        </p>
                    )
                }
                case 'assignments':
                    return !item.assignments?.length ? (
                        <div className="flex justify-center">
                            <HeroTooltip content="Assign members">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onPress={() => onAssignMember(item.no)}
                                >
                                    <UserRoundPlus
                                        size={16}
                                        className="opacity-60"
                                    />
                                </Button>
                            </HeroTooltip>
                        </div>
                    ) : (
                        <Avatar.Group max={{ count: 3 }}>
                            {item.assignments.map((ass) => (
                                <Avatar
                                    key={ass.id}
                                    src={optimizeCloudinary(ass.user.avatar)}
                                />
                            ))}
                        </Avatar.Group>
                    )
                case 'isPaid':
                    return (
                        <PaidChip
                            status={item.isPaid ? 'paid' : 'unpaid'}
                            classNames={{
                                base: '!w-[100px]',
                                content: '!w-[100px] text-center',
                            }}
                        />
                    )
                case 'dueAt': {
                    const sysType = item.status.systemType
                    const isFinished =
                        sysType === JobStatusSystemTypeEnum.COMPLETED ||
                        sysType === JobStatusSystemTypeEnum.TERMINATED
                    return (
                        <div className="w-full flex justify-end">
                            {isFinished ? (
                                <JobFinishChip
                                    status={
                                        sysType ===
                                        JobStatusSystemTypeEnum.COMPLETED
                                            ? 'completed'
                                            : 'finish'
                                    }
                                />
                            ) : (
                                <CountdownTimer
                                    targetDate={dayjs(item.dueAt)}
                                    hiddenUnits={['second', 'year']}
                                    className="text-right!"
                                />
                            )}
                        </div>
                    )
                }
                case 'status':
                    return (
                        <div className="flex justify-center">
                            <JobStatusDropdown
                                jobData={item}
                                statusData={item.status}
                                afterChangeStatus={onRefresh}
                            />
                        </div>
                    )
                case 'action':
                    return (
                        <div className="flex items-center justify-end gap-1">
                            <HeroTooltip content="View detail">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onPress={() => onViewDetail(item.no)}
                                >
                                    <EyeIcon size={18} className="opacity-60" />
                                </Button>
                            </HeroTooltip>
                            <WorkbenchTableQuickActions data={item} />
                        </div>
                    )
                default:
                    return cellValue as ReactNode
            }
        },
        [showJobSentitive, onRefresh, onViewDetail, onAssignMember]
    )

    return (
        <HeroTable
            isHeaderSticky
            aria-label="Workbench table"
            bottomContent={bottomContent}
            sortString={sort}
            onSortStringChange={onSortChange}
            selectedKeys={selectedKeys}
            selectionMode="single"
            topContent={topContent}
            onSelectionChange={setSelectedKeys}
            onRowAction={(key) => onViewDetail(key as string)}
            classNames={{
                table: 'relative',
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
                loadingContent={<Spinner label="Loading workbench..." />}
            >
                {(item) => (
                    <HeroTableRow key={item.no}>
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
