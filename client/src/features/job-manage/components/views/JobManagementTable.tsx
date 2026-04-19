import {
    cancelJobOptions,
    currencyFormatter,
    INTERNAL_URLS,
    JobHelper,
    optimizeCloudinary,
    restoreJobOptions,
    RouteUtil
} from '@/lib'
import {
    EJobManagementTableTabs,
    TManageJobsParams,
} from '@/routes/_administrator/mgmt/jobs'
import { HeroCopyButton } from '@/shared/components'
import JobFinishChip from '@/shared/components/chips/JobFinishChip'
import { JobStatusChip } from '@/shared/components/chips/JobStatusChip'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import { HeroButton } from '@/shared/components/ui/hero-button'
import { HeroTable } from '@/shared/components/ui/hero-table'
import { HeroTooltip } from '@/shared/components/ui/hero-tooltip'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { TJob } from '@/shared/types'
import { ArrowRotateLeft } from '@gravity-ui/icons'
import {
    addToast,
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Pagination,
    Selection,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { Avatar } from 'antd'
import dayjs from 'dayjs'
import {
    CloudIcon,
    Eye,
    MoreVertical,
    SquareArrowOutUpRight,
    Trash2,
    TruckElectricIcon,
} from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { ConfirmCancelJobModal } from '../modals/ConfirmCancelJobModal'
import { ConfirmRestoreJob } from '../modals/ConfirmRestoreJobModal'

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
    onSelectionChange: (keys: Selection) => void
    onBulkAction: (type: 'DELETE' | 'STATUS') => void
    searchParams: TManageJobsParams
    onRefetch: () => void
}
export function JobManagementTable({
    data,
    pagination,
    isLoadingData,
    selectedKeys,
    sort,
    onSelectionChange,
    searchParams,
    onRefetch,
}: JobManagementTableProps) {
    const router = useRouter()
    const cancelJobModalState = useDisclosure()
    const restoreJobModalState = useDisclosure()

    const [selectedJob, setSelectedJob] = useState<TJob | null>(null)

    const cancelJobAction = useMutation(cancelJobOptions)
    const restoreJobAction = useMutation(restoreJobOptions)

    const handleCancelJob = () => {
        if (selectedJob) {
            cancelJobAction.mutateAsync(selectedJob.id, {
                onSuccess() {
                    cancelJobModalState.onClose()
                    onRefetch()
                    addToast({
                        title: 'Successfully',
                        description: `${selectedJob.no}- ${selectedJob.displayName} has been successfully canceled.`,
                        color: 'success',
                    })
                },
            })
        }
    }
    const handleRestoreJob = () => {
        if (selectedJob) {
            restoreJobAction.mutateAsync(selectedJob.id, {
                onSuccess() {
                    restoreJobModalState.onClose()
                    onRefetch()
                    addToast({
                        title: 'Successfully',
                        description: `${selectedJob.no}- ${selectedJob.displayName} has been restore successfully.`,
                        color: 'success',
                    })
                },
            })
        }
    }

    // --- Render Cell ---
    const renderCell = useCallback(
        (data: TJob, columnKey: React.Key) => {
            const sharepointUrl =
                data?.sharepointFolder?.webUrl ||
                data?.folderTemplate?.webUrl ||
                null

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
                            <p className="font-bold text-text-default uppercase">
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
                case 'isPaid': {
                    const paymentDisplay = JobHelper.getJobPaymentStatusDisplay(
                        data.paymentStatus
                    )

                    return (
                        <Chip color={paymentDisplay.colorName} variant="flat">
                            <span className="font-semibold">
                                {paymentDisplay.title}
                            </span>
                        </Chip>
                    )
                }

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
                            <HeroTooltip content="Deliveries">
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
                                        as={Link}
                                        href={INTERNAL_URLS.jobDetail(data.no)}
                                    >
                                        View public page
                                    </DropdownItem>
                                    <DropdownItem
                                        key="open-directory"
                                        startContent={<CloudIcon size={16} />}
                                        as={'a'}
                                        target="_blank"
                                        href={sharepointUrl}
                                    >
                                        Sharepoint directory
                                    </DropdownItem>
                                    {searchParams.tab !==
                                    EJobManagementTableTabs.CANCELED ? (
                                        <DropdownItem
                                            key="delete"
                                            startContent={<Trash2 size={16} />}
                                            className="text-danger"
                                            color="danger"
                                            onPress={() => {
                                                setSelectedJob(data)
                                                cancelJobModalState.onOpen()
                                            }}
                                        >
                                            Delete
                                        </DropdownItem>
                                    ) : (
                                        <DropdownItem
                                            key="restore"
                                            startContent={
                                                <ArrowRotateLeft
                                                    fontSize={16}
                                                />
                                            }
                                            className="text-danger"
                                            color="danger"
                                            onPress={() => {
                                                setSelectedJob(data)
                                                restoreJobModalState.onOpen()
                                            }}
                                        >
                                            Restore
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    )
                default:
                    // @ts-ignore
                    return data[columnKey]
            }
        },
        [router, searchParams]
    )

    // --- Top Content ---

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
        <>
            {cancelJobModalState.isOpen && (
                <ConfirmCancelJobModal
                    isOpen={cancelJobModalState.isOpen}
                    onOpenChange={cancelJobModalState.onOpenChange}
                    onConfirm={handleCancelJob}
                />
            )}
            {restoreJobModalState.isOpen && (
                <ConfirmRestoreJob
                    isOpen={restoreJobModalState.isOpen}
                    onOpenChange={restoreJobModalState.onOpenChange}
                    onConfirm={handleRestoreJob}
                />
            )}
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
                            align={
                                column.uid === 'actions' ? 'center' : 'start'
                            }
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
                                <TableCell>
                                    {renderCell(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </HeroTable>
        </>
    )
}
