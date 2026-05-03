import {
    cancelJobOptions,
    currencyFormatter,
    INTERNAL_URLS,
    JobHelper,
    optimizeCloudinary,
    restoreJobOptions,
    RouteUtil,
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
import { HeroTooltip } from '@/shared/components/ui/hero-tooltip'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { TJob } from '@/shared/types'
import { ArrowRotateLeft } from '@gravity-ui/icons'
import {
    addToast,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Checkbox,
    Chip,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Pagination,
    Selection,
    Spinner,
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
import { useMemo, useState } from 'react'
import { ConfirmCancelJobModal } from '../modals/ConfirmCancelJobModal'
import { ConfirmRestoreJob } from '../modals/ConfirmRestoreJobModal'

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

export function JobManagementGrid({
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

    // --- Selection Logic ---
    const isSelected = (id: string) => {
        if (selectedKeys === 'all') return true
        return selectedKeys.has(id)
    }

    const toggleSelection = (id: string) => {
        if (selectedKeys === 'all') {
            const newKeys = new Set(data.map((d) => d.id))
            newKeys.delete(id)
            onSelectionChange(newKeys)
        } else {
            const newKeys = new Set(selectedKeys)
            if (newKeys.has(id)) {
                newKeys.delete(id)
            } else {
                newKeys.add(id)
            }
            onSelectionChange(newKeys)
        }
    }

    const toggleAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange('all')
        } else {
            onSelectionChange(new Set([]))
        }
    }

    const allSelected =
        selectedKeys === 'all' ||
        (data.length > 0 && selectedKeys.size === data.length)

    // --- Bottom Content (Pagination) ---
    const bottomContent = useMemo(() => {
        return (
            <div className="py-4 px-2 flex justify-between items-center bg-white border-t border-default-200 mt-4 rounded-b-xl">
                <span className="w-[30%] text-small text-default-500 font-medium">
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
                                page: (pagination.page || 1) - 1,
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
                                page: (pagination.page || 1) + 1,
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
        <div className="flex flex-col gap-4">
            {/* Modals */}
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

            {/* Toolbar Area */}
            <div className="flex items-center justify-between px-2 pb-2">
                <Checkbox isSelected={allSelected} onValueChange={toggleAll}>
                    <span className="font-semibold text-sm">Select All</span>
                </Checkbox>
            </div>

            {/* Loading State */}
            {isLoadingData ? (
                <div className="flex flex-col items-center justify-center py-20 bg-default-50/50 rounded-2xl border border-default-200 border-dashed">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-4 text-default-500 font-medium">
                        Loading jobs...
                    </p>
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-default-50/50 rounded-2xl border border-default-200 border-dashed">
                    <p className="text-default-500 font-medium text-lg">
                        No jobs found matching your criteria.
                    </p>
                </div>
            ) : (
                /* Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map((job) => {
                        const sharepointUrl =
                            job?.sharepointFolder?.webUrl ||
                            job?.folderTemplate?.webUrl ||
                            null

                        const isCompleted =
                            job.status.systemType ===
                            JobStatusSystemTypeEnum.COMPLETED
                        const isFinish =
                            job.status.systemType ===
                            JobStatusSystemTypeEnum.TERMINATED
                        const isPaused = isCompleted || isFinish

                        const paymentDisplay =
                            JobHelper.getJobPaymentStatusDisplay(
                                job.paymentStatus
                            )

                        return (
                            <Card
                                key={job.id}
                                shadow="sm"
                                className={`border transition-all duration-200 ${
                                    isSelected(job.id)
                                        ? 'border-primary ring-1 ring-primary bg-primary-50/10'
                                        : 'border-default-200 hover:border-default-300'
                                }`}
                            >
                                <CardHeader className="flex items-start justify-between gap-3 pt-4 px-4 pb-2">
                                    <div className="flex flex-col gap-1 items-start w-full overflow-hidden">
                                        <div className="flex items-center gap-2 mb-1 w-full">
                                            <Checkbox
                                                isSelected={isSelected(job.id)}
                                                onValueChange={() =>
                                                    toggleSelection(job.id)
                                                }
                                                className="shrink-0"
                                            />
                                            <span className="text-sm font-bold uppercase text-default-600 truncate">
                                                {job.no}
                                            </span>
                                            <HeroTooltip content="Copy">
                                                <div>
                                                    <HeroCopyButton
                                                        textValue={job.no}
                                                        className="opacity-60 hover:opacity-100 transition-opacity min-w-unit-0 w-6 h-6 shrink-0"
                                                    />
                                                </div>
                                            </HeroTooltip>
                                        </div>
                                        <h3
                                            className="font-bold text-lg text-default-900 leading-tight line-clamp-2"
                                            title={job.displayName}
                                        >
                                            {job.displayName}
                                        </h3>
                                        <p
                                            className="text-sm font-medium text-default-500 line-clamp-1"
                                            title={job.client?.name}
                                        >
                                            {job.client?.name || 'No Client'}
                                        </p>
                                    </div>
                                </CardHeader>

                                <CardBody className="px-4 py-3 gap-4 overflow-visible">
                                    <div className="flex flex-col gap-3">
                                        {/* Status & Payment Badges */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <JobStatusChip
                                                data={job.status}
                                                classNames={{
                                                    base: 'h-6 px-2 min-w-0',
                                                    content:
                                                        'uppercase text-[10px] font-bold',
                                                }}
                                            />
                                            <Chip
                                                color={paymentDisplay.colorName}
                                                variant="flat"
                                                size="sm"
                                                className="h-6 px-1"
                                            >
                                                <span className="font-semibold text-[10px]">
                                                    {paymentDisplay.title}
                                                </span>
                                            </Chip>
                                        </div>

                                        {/* Financials Block */}
                                        <div className="flex items-center justify-between bg-default-50 p-2.5 rounded-xl border border-default-100">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-default-500 tracking-wider">
                                                    Income
                                                </span>
                                                <span className="text-sm font-bold text-success-600">
                                                    {currencyFormatter(
                                                        job.incomeCost
                                                    )}
                                                </span>
                                            </div>
                                            <Divider
                                                orientation="vertical"
                                                className="h-6"
                                            />
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] uppercase font-bold text-default-500 tracking-wider">
                                                    Staff Cost
                                                </span>
                                                <span className="text-sm font-bold text-danger-600">
                                                    {currencyFormatter(
                                                        job.totalStaffCost,
                                                        'Vietnamese'
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Assignees & Timeline */}
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center gap-2">
                                                {!job.assignments.length ? (
                                                    <span className="text-xs italic text-default-400 font-medium">
                                                        Unassigned
                                                    </span>
                                                ) : (
                                                    <Avatar.Group
                                                        max={{ count: 3 }}
                                                        size="small"
                                                        style={{ gap: '-8px' }}
                                                    >
                                                        {job.assignments.map(
                                                            (ass) => (
                                                                <Avatar
                                                                    key={
                                                                        ass.user
                                                                            .id
                                                                    }
                                                                    src={optimizeCloudinary(
                                                                        ass.user
                                                                            .avatar
                                                                    )}
                                                                    style={{
                                                                        border: '2px solid white',
                                                                    }}
                                                                />
                                                            )
                                                        )}
                                                    </Avatar.Group>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-0.5">
                                                    Timeline
                                                </span>
                                                {isPaused ? (
                                                    <JobFinishChip
                                                        status={
                                                            isCompleted
                                                                ? 'completed'
                                                                : 'finish'
                                                        }
                                                    />
                                                ) : (
                                                    <CountdownTimer
                                                        targetDate={dayjs(
                                                            job.dueAt
                                                        )}
                                                        hiddenUnits={[
                                                            'second',
                                                            'year',
                                                        ]}
                                                        paused={isPaused}
                                                        className="text-right! !text-xs font-semibold"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>

                                <Divider />

                                <CardFooter className="px-4 py-2.5 flex justify-between items-center bg-default-50/50 rounded-b-xl">
                                    <span className="text-[10px] uppercase font-bold tracking-wider bg-default-200 text-default-700 px-2 py-1 rounded">
                                        {job.type.displayName}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <HeroTooltip content="View details">
                                            <HeroButton
                                                size="sm"
                                                isIconOnly
                                                variant="light"
                                                color="primary"
                                                onPress={() =>
                                                    router.navigate({
                                                        href: INTERNAL_URLS.management.jobDetail(
                                                            job.no
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
                                                color="primary"
                                                onPress={() =>
                                                    router.navigate({
                                                        href:
                                                            INTERNAL_URLS.management.jobDetail(
                                                                job.no
                                                            ) +
                                                            '?tab=deliveries',
                                                    })
                                                }
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
                                                        <SquareArrowOutUpRight
                                                            size={16}
                                                        />
                                                    }
                                                    as={Link}
                                                    href={INTERNAL_URLS.jobDetail(
                                                        job.no
                                                    )}
                                                >
                                                    View public page
                                                </DropdownItem>
                                                <DropdownItem
                                                    key="open-directory"
                                                    startContent={
                                                        <CloudIcon size={16} />
                                                    }
                                                    as={'a'}
                                                    target="_blank"
                                                    href={sharepointUrl || '#'}
                                                >
                                                    Sharepoint directory
                                                </DropdownItem>
                                                {searchParams.tab !==
                                                EJobManagementTableTabs.CANCELED ? (
                                                    <DropdownItem
                                                        key="delete"
                                                        startContent={
                                                            <Trash2 size={16} />
                                                        }
                                                        className="text-danger"
                                                        color="danger"
                                                        onPress={() => {
                                                            setSelectedJob(job)
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
                                                            setSelectedJob(job)
                                                            restoreJobModalState.onOpen()
                                                        }}
                                                    >
                                                        Restore
                                                    </DropdownItem>
                                                )}
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {bottomContent}
        </div>
    )
}
