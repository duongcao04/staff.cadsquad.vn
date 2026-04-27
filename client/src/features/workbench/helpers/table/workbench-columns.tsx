import { dateFormatter, optimizeCloudinary } from '@/lib'
import {
    APP_PERMISSIONS,
    currencyFormatter,
    IMAGES,
    INTERNAL_URLS,
} from '@/lib/utils'
import { HeroCopyButton, HeroTooltip } from '@/shared/components'
import JobFinishChip from '@/shared/components/chips/JobFinishChip'
import JobStatusDropdown from '@/shared/components/dropdowns/JobStatusDropdown'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { TJob, TJobStatus } from '@/shared/types'
import { Button, Chip } from '@heroui/react'
import { Column, createColumnHelper } from '@tanstack/react-table'
import { Avatar, Image } from 'antd'
import dayjs from 'dayjs'
import {
    AtSign,
    BanknoteArrowUp,
    CalendarClock,
    DollarSignIcon,
    EyeIcon,
    GalleryThumbnailsIcon,
    HandIcon,
    Handshake,
    HashIcon,
    Layers2Icon,
    LoaderIcon,
    UserRoundPlus,
    UsersRound,
    WalletIcon,
} from 'lucide-react'
import { WorkbenchTableQuickActions } from '../../components/modals/WorkbenchTableQuickActions'

const columnHelper = createColumnHelper<TJob>()

interface IGetWorkbenchColumns {
    userPermissions: string[]
    onRefresh: () => void
    onAssignMember: (jobNo: string) => void
    onViewDetail: (jobNo: string) => void
}
export const getWorkbenchColumns = ({
    userPermissions,
    onRefresh,
    onViewDetail,
    onAssignMember,
}: IGetWorkbenchColumns) => [
    columnHelper.accessor('status.thumbnailUrl', {
        id: 'thumbnail',
        header: 'Thumbnail',
        meta: {
            icon: GalleryThumbnailsIcon,
        },
        cell: ({ row }) => {
            const data = row.original
            return (
                <div className="flex items-center justify-center">
                    <div className="overflow-hidden rounded-full size-10">
                        <Image
                            src={
                                optimizeCloudinary(data.status.thumbnailUrl, {
                                    width: 50,
                                    height: 50,
                                }) || IMAGES.loadingPlaceholder
                            }
                            alt="image"
                            className="object-cover rounded-full size-full"
                            preview={false}
                        />
                    </div>
                </div>
            )
        },
    }),

    columnHelper.accessor('client.name', {
        id: 'clientName',
        header: 'Client',
        meta: {
            icon: Handshake,
        },
        cell: ({ getValue }) => (
            <p className="line-clamp-1">{getValue() || 'Unknown client'}</p>
        ),
    }),

    columnHelper.accessor('type.displayName', {
        id: 'type',
        header: 'Job type',
        meta: {
            icon: Layers2Icon,
        },
        cell: ({ getValue }) => (
            <p className="line-clamp-1 select-text">
                {getValue() || 'Unknown type'}
            </p>
        ),
    }),

    columnHelper.accessor('no', {
        header: 'Job no.',
        meta: {
            icon: HashIcon,
        },
        cell: ({ getValue }) => (
            <div className="flex items-center justify-between gap-2 group size-full">
                <span className="uppercase">{getValue()}</span>
                <HeroTooltip content="Copy">
                    <HeroCopyButton
                        textValue={getValue()}
                        className="opacity-70!"
                    />
                </HeroTooltip>
            </div>
        ),
    }),

    columnHelper.accessor('displayName', {
        header: 'Job name',
        meta: {
            icon: AtSign,
        },
        cell: ({ getValue }) => (
            <p className="line-clamp-1 font-medium uppercase select-text">
                {getValue()}
            </p>
        ),
    }),

    columnHelper.accessor('incomeCost', {
        header: 'Income cost',
        enableHiding: true,
        meta: {
            icon: DollarSignIcon,
            requiredPermissions: [APP_PERMISSIONS.JOB.READ_INCOME],
            bypassPermission: APP_PERMISSIONS.JOB.MANAGE,
        },
        cell: ({ getValue }) => (
            <p className="font-bold text-right text-currency select-text">
                {currencyFormatter(getValue())}
            </p>
        ),
    }),

    columnHelper.accessor('totalStaffCost', {
        header: 'Total staff sost',
        meta: {
            icon: WalletIcon,
            requiredPermissions: [APP_PERMISSIONS.JOB.READ_STAFF_COST],
            bypassPermission: APP_PERMISSIONS.JOB.MANAGE,
        },
        enableHiding: true,
        cell: ({ getValue }) => (
            <p className="font-bold text-right text-currency select-text">
                {currencyFormatter(getValue())}
            </p>
        ),
    }),

    columnHelper.accessor('staffCost', {
        header: 'Your cost',
        meta: {
            icon: WalletIcon,
        },
        cell: ({ getValue }) =>
            getValue() ? (
                <p className="font-bold text-right text-currency select-text">
                    {currencyFormatter(getValue() || '')}
                </p>
            ) : (
                <p className="text-xs text-right text-text-subdued italic">
                    Unassigned
                </p>
            ),
    }),

    columnHelper.accessor('status', {
        header: 'Status',
        meta: {
            icon: LoaderIcon,
        },
        enableHiding: true,
        cell: ({ row }) => (
            <div className="z-0 flex items-center justify-center">
                <JobStatusDropdown
                    jobData={row.original}
                    statusData={row.original.status as TJobStatus}
                    afterChangeStatus={onRefresh}
                />
            </div>
        ),
    }),

    columnHelper.accessor('dueAt', {
        header: 'Due on',
        meta: {
            icon: CalendarClock,
        },
        cell: ({ row, getValue }) => {
            const data = row.original
            const isCompleted =
                data.status.systemType === JobStatusSystemTypeEnum.COMPLETED
            const isFinish =
                data.status.systemType === JobStatusSystemTypeEnum.TERMINATED
            const isPaused = isCompleted || isFinish

            return (
                <div className="w-full">
                    {isPaused ? (
                        <JobFinishChip
                            status={isCompleted ? 'completed' : 'finish'}
                        />
                    ) : (
                        <CountdownTimer
                            targetDate={dayjs(getValue())}
                            hiddenUnits={['second', 'year']}
                            paused={isPaused}
                            className="text-right!"
                        />
                    )}
                </div>
            )
        },
    }),

    columnHelper.accessor('assignments', {
        header: 'Assignees',
        meta: {
            icon: UsersRound,
        },
        cell: ({ getValue, row }) => {
            const assignments = getValue()
            if (!assignments?.length) {
                return (
                    <div className="flex items-center justify-center size-full">
                        <HeroTooltip content="Assign members">
                            <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                className="size-8! flex items-center justify-center"
                                onPress={() => onAssignMember(row.original.no)}
                            >
                                <UserRoundPlus
                                    size={16}
                                    className="opacity-60"
                                />
                            </Button>
                        </HeroTooltip>
                    </div>
                )
            }
            return (
                <div className="w-fit">
                    <Avatar.Group
                        max={{
                            count: 4,
                            style: {
                                color: 'var(--color-primary)',
                                backgroundColor: 'var(--color-primary-50)',
                            },
                            popover: {
                                styles: { body: { borderRadius: '16px' } },
                            },
                        }}
                    >
                        {assignments.map((ass: any) => (
                            <Avatar
                                key={ass.id}
                                src={optimizeCloudinary(ass.user.avatar, {
                                    width: 50,
                                    height: 50,
                                })}
                            />
                        ))}
                    </Avatar.Group>
                </div>
            )
        },
    }),

    columnHelper.accessor('payoutDate', {
        header: 'Payout at',
        meta: {
            icon: BanknoteArrowUp,
        },
        cell: ({ getValue }) =>
            getValue() ? (
                <div className="z-0 flex items-center justify-center">
                    {dateFormatter(getValue() || '')}
                </div>
            ) : (
                <Chip
                    size="sm"
                    color="danger"
                    variant="flat"
                    classNames={{ content: 'font-semibold' }}
                >
                    Unpaid
                </Chip>
            ),
    }),

    columnHelper.display({
        id: 'action',
        meta: {
            icon: HandIcon,
            headerName: 'Actions',
        },
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const data = row.original
            return (
                <div className="flex items-center justify-end gap-2">
                    <HeroTooltip content="View details">
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="size-8! flex items-center justify-center"
                            onPress={() => onViewDetail(data.no)}
                        >
                            <EyeIcon size={18} className="opacity-60" />
                        </Button>
                    </HeroTooltip>
                    <HeroTooltip content="Copy link">
                        <HeroCopyButton
                            className="size-8! flex items-center justify-center"
                            iconSize={16}
                            iconClassName="opacity-60"
                            textValue={INTERNAL_URLS.jobDetail(data.no)}
                        />
                    </HeroTooltip>
                    <WorkbenchTableQuickActions
                        data={data}
                        onRefresh={onRefresh}
                    />
                </div>
            )
        },
    }),
]
