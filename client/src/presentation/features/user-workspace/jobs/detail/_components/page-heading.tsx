import { JobStatusSystemTypeEnum } from '@/presentation/enums'
import { INTERNAL_URLS } from '@/presentation/lib/utils'
import { TJob } from '@/presentation/types'
import { PencilToLine } from '@gravity-ui/icons'
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from '@heroui/react'
import { CountdownTimer, JobFinishChip } from '@presentation/components'
import { Link, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    LinkIcon,
    PinIcon,
    Wallet,
} from 'lucide-react'

export function PageHeading({ job }: { job: TJob }) {
    const router = useRouter()
    const isJobCompleted =
        job?.status?.systemType === JobStatusSystemTypeEnum.COMPLETED
    const isJobFinished =
        job?.status?.systemType === JobStatusSystemTypeEnum.TERMINATED
    const isPaused = isJobCompleted || isJobFinished

    return (
        <div
            className="flex flex-col px-6 pt-6 pb-5 space-y-3"
            style={{
                backgroundColor: job.status?.hexColor
                    ? `${job.status.hexColor}15`
                    : 'transparent',
                borderBottom: `1px solid ${job.status?.hexColor ? `${job.status.hexColor}30` : 'var(--nextui-colors-default-200)'}`,
            }}
        >
            <div className="flex items-start justify-between w-full pr-5">
                <div className="flex items-center gap-4">
                    <Button
                        as={Link}
                        isIconOnly
                        variant="bordered"
                        className="border-1 border-border-default bg-background"
                        href={INTERNAL_URLS.projectCenter}
                    >
                        <ChevronLeft />
                    </Button>
                    <h2 className="text-2xl font-bold leading-tight tracking-wider text-text-default">
                        {job.no}- {job.client?.name.toUpperCase()}_
                        {job.displayName.toUpperCase()}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="bordered"
                        className="font-medium border-1 bg-background"
                        startContent={<PencilToLine fontSize={14} />}
                        onPress={() =>
                            router.navigate({
                                href: INTERNAL_URLS.management.jobDetail(
                                    job.no
                                ),
                            })
                        }
                    >
                        Edit
                    </Button>

                    <Dropdown
                        placement="bottom-end"
                        classNames={{
                            content:
                                'border border-default-200 shadow-lg min-w-[220px]',
                        }}
                    >
                        <DropdownTrigger>
                            <Button
                                size="sm"
                                variant="bordered"
                                className="font-medium border-1 bg-background"
                                endContent={
                                    <ChevronRight
                                        size={14}
                                        className="rotate-90"
                                    />
                                }
                            >
                                Actions
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Project Actions"
                            variant="flat"
                        >
                            <DropdownSection title="General" showDivider>
                                <DropdownItem
                                    key="pin"
                                    startContent={<PinIcon size={16} />}
                                >
                                    Pin to Dashboard
                                </DropdownItem>
                                <DropdownItem
                                    key="copy-link"
                                    startContent={<LinkIcon size={16} />}
                                >
                                    Copy Project Link
                                </DropdownItem>
                            </DropdownSection>
                            <DropdownSection title="Data & Audit" showDivider>
                                <DropdownItem
                                    key="history"
                                    description="View all activity logs"
                                    startContent={
                                        <Clock
                                            size={16}
                                            className="text-default-400"
                                        />
                                    }
                                >
                                    Activity History
                                </DropdownItem>
                                <DropdownItem
                                    key="audit"
                                    description="Review financial details"
                                    startContent={
                                        <Wallet
                                            size={16}
                                            className="text-primary"
                                        />
                                    }
                                >
                                    Financial Audit
                                </DropdownItem>
                            </DropdownSection>
                            <DropdownSection title="Danger Zone">
                                <DropdownItem
                                    key="archive"
                                    startContent={<AlertCircle size={16} />}
                                >
                                    Archive Project
                                </DropdownItem>
                                <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<AlertCircle size={16} />}
                                >
                                    Delete Permanently
                                </DropdownItem>
                            </DropdownSection>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
            <div className="w-fit pl-3 pr-5 py-1.5 bg-background rounded-full">
                {isPaused ? (
                    <JobFinishChip
                        status={isJobCompleted ? 'completed' : 'finish'}
                    />
                ) : (
                    <div className="flex items-center gap-1.5 text-text-subdued">
                        <Clock size={14} />
                        <p className="pt-0.5 text-sm font-medium">Due on:</p>
                        <CountdownTimer
                            targetDate={dayjs(job?.dueAt)}
                            hiddenUnits={['second', 'year']}
                            paused={isPaused}
                            className="text-right! text-sm font-semibold"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
