import { optimizeCloudinary } from '@/lib'
import { dateFormatter } from '@/lib/dayjs'
import {
    currencyFormatter,
    getJobPaymentStatusDisplay,
    IMAGES,
    INTERNAL_URLS,
} from '@/lib/utils'
import { HeroButton, HeroCopyButton, HeroTooltip } from '@/shared/components'
import JobFinishChip from '@/shared/components/chips/JobFinishChip'
import JobStatusDropdown from '@/shared/components/dropdowns/JobStatusDropdown'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { JobColumnKey, TJob, TJobStatus } from '@/shared/types'
import { Button, Chip } from '@heroui/react'
import { Avatar, Image } from 'antd'
import dayjs from 'dayjs'
import lodash from 'lodash'
import { EyeIcon, FilePlus, UserRoundPlus } from 'lucide-react'
import { ReactNode } from 'react'
import { ProjectCenterTableQuickActions } from '../components/dropdowns/ProjectCenterTableQuickActions'

type CellActions = {
    onViewDetail: (jobNo: string) => void
    onAssignMember: (jobNo: string) => void
    onAddAttachments: (jobNo: string) => void
    onRefresh: () => void
}

export const renderProjectCenterCell = (
    data: TJob,
    columnKey: JobColumnKey,
    actions: CellActions
): ReactNode => {
    const cellValue = lodash.get(data, columnKey, '')

    switch (columnKey) {
        case 'thumbnailUrl':
            return (
                <div className="flex items-center justify-center">
                    <div className="overflow-hidden rounded-full size-10">
                        <Image
                            src={
                                data.status.thumbnailUrl ||
                                IMAGES.loadingPlaceholder
                            }
                            alt="image"
                            className="object-cover rounded-full size-full"
                            preview={false}
                        />
                    </div>
                </div>
            )
        case 'clientName':
            return (
                <p className="line-clamp-1 select-text cursor-text">
                    {data.client?.name || 'Unknown client'}
                </p>
            )

        case 'type':
            return <p className="line-clamp-1">{data.type.displayName}</p>

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

        case 'displayName':
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

        case 'incomeCost':
            return (
                <p className="font-bold text-right text-currency">
                    {currencyFormatter(data.incomeCost)}
                </p>
            )

        case 'totalStaffCost':
            return (
                <p className="font-bold text-right text-currency">
                    {currencyFormatter(data.totalStaffCost, 'Vietnamese')}
                </p>
            )

        case 'staffCost':
            return data.staffCost ? (
                <p className="font-bold text-right text-currency">
                    {currencyFormatter(data.staffCost, 'Vietnamese')}
                </p>
            ) : (
                <p className="text-xs italic text-text-subdued text-right">
                    Not assigned
                </p>
            )

        case 'status':
            return (
                <div className="flex items-center justify-center z-0">
                    <JobStatusDropdown
                        jobData={data}
                        statusData={data.status as TJobStatus}
                        afterChangeStatus={actions.onRefresh}
                    />
                </div>
            )

        case 'dueAt': {
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
                            targetDate={dayjs(data.dueAt)}
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
                            onPress={() => actions.onAddAttachments(data.no)}
                            color="default"
                        >
                            <FilePlus size={16} className="opacity-60" />
                        </HeroButton>
                    </HeroTooltip>
                </div>
            ) : (
                <p className="w-full text-center font-medium tracking-wide">
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
                            onPress={() => actions.onAssignMember(data.no)}
                        >
                            <UserRoundPlus size={16} className="opacity-60" />
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
                                backgroundColor: 'var(--color-primary-50)',
                            },
                            popover: {
                                styles: { body: { borderRadius: '16px' } },
                            },
                        }}
                    >
                        {data.assignments.map((ass) => (
                            <Avatar
                                key={ass.id}
                                src={optimizeCloudinary(ass.user.avatar)}
                            />
                        ))}
                    </Avatar.Group>
                </div>
            )

        case 'paymentStatus':
            const paymentDisplay = getJobPaymentStatusDisplay(
                data.paymentStatus
            )

            return (
                <Chip color={paymentDisplay.colorName}>
                    {paymentDisplay.title}
                </Chip>
            )

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
                            onPress={() => actions.onViewDetail(data.no)}
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
                    <ProjectCenterTableQuickActions data={data} />
                </div>
            )

        default:
            return cellValue as ReactNode
    }
}
