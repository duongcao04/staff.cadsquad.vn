import { dateFormatter } from '@/lib'
import { optimizeCloudinary } from '@/lib/cloudinary'
import { currencyFormatter, IMAGES, INTERNAL_URLS } from '@/lib/utils'
import { HeroButton, HeroCopyButton, HeroTooltip } from '@/shared/components'
import JobFinishChip from '@/shared/components/chips/JobFinishChip'
import JobStatusDropdown from '@/shared/components/dropdowns/JobStatusDropdown'
import PaymentStatusDropdown from '@/shared/components/dropdowns/PaymentStatusDropdown'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { JobColumnKey, TJob, TJobStatus } from '@/shared/types'
import { Button } from '@heroui/react'
import { Avatar, Image } from 'antd'
import dayjs from 'dayjs'
import lodash from 'lodash'
import { EyeIcon, FilePlusIcon, UserRoundPlus } from 'lucide-react'
import { ReactNode } from 'react'
import { WorkbenchTableQuickActions } from '../components/modals/WorkbenchTableQuickActions'

type CellActions = {
    onViewDetail: (jobNo: string) => void
    onAssignMember: (jobNo: string) => void
    onRefresh: () => void
    onAddAttachments: (jobNo: string) => void
}

export const renderWorkbenchCell = (
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
                <p className="line-clamp-1">
                    {data.client?.name || 'Unknown client'}
                </p>
            )

        case 'type':
            return <p className="line-clamp-1">{data.type.displayName}</p>

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
                            <FilePlusIcon size={16} className="opacity-60" />
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
                    <WorkbenchTableQuickActions data={data} />
                </div>
            )

        default:
            return cellValue as ReactNode
    }
}
