import { dateFormatter, jobStatusesListOptions } from '@/lib'
import { HeroButton, HeroTooltip } from '@/shared/components'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { TJob } from '@/shared/types'
import { Card, CardBody } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Clock, InfoIcon, TruckElectricIcon } from 'lucide-react'
import { useMemo } from 'react'

export function JobStatusProgressCard({ job }: { job: TJob }) {
    const {
        data: { jobStatuses },
    } = useSuspenseQuery(jobStatusesListOptions())

    // 1. Find the active index
    const activeIndex = useMemo(() => {
        if (!jobStatuses.length) return 0
        const index = jobStatuses.findIndex((s) => s.id === job.status.id)
        return index !== -1 ? index : 0
    }, [job.status.id, jobStatuses])

    // 2. Safely get the active status object
    const activeStatus = useMemo(() => {
        return jobStatuses[activeIndex] || job?.status
    }, [activeIndex, jobStatuses, job?.status])

    const isJobWaitReview =
        job?.status?.systemType === JobStatusSystemTypeEnum.DELIVERED

    return (
        <Card shadow="none" className="border border-border-default rounded-xl">
            <CardBody className="p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <div className="flex flex-col gap-0.5 shrink-0">
                        {/* Title and Tooltip Row */}
                        <div className="flex items-center gap-0.5">
                            <span className="text-xs font-medium text-text-subdued tracking-wider">
                                Current Stage
                            </span>

                            <HeroButton
                                tooltip={
                                    <div className="px-1 py-1 flex flex-col gap-0.5 max-w-50">
                                        <div className="text-tiny font-bold text-white">
                                            Active Stage
                                        </div>
                                        <div className="text-tiny text-text-subdued">
                                            This is the current step in the
                                            job's workflow.
                                        </div>
                                    </div>
                                }
                                tooltipProps={{
                                    placement: 'right',
                                }}
                                size="xs"
                                variant="light"
                            >
                                <InfoIcon size={12} />
                            </HeroButton>
                        </div>

                        {/* The actual stage name */}
                        <p
                            className="font-bold text-xl transition-colors duration-300"
                            style={{
                                color: activeStatus?.hexColor || 'inherit',
                            }}
                        >
                            {activeStatus?.displayName || 'Unknown'}
                        </p>
                    </div>
                    <div className="h-full flex flex-col justify-center items-end">
                        {job.finishedAt ? (
                            <>
                                <div
                                    className="flex items-center gap-1"
                                    style={{
                                        color: job.status.hexColor,
                                    }}
                                >
                                    <Clock size={12} strokeWidth={2.3} />
                                    <span className="text-[11px] font-medium leading-4">
                                        Finished{' '}
                                        {dateFormatter(job.finishedAt, {
                                            format: 'longDate',
                                        })}
                                    </span>
                                </div>
                                <span className="text-[10px] text-text-subdued italic">
                                    Approved at
                                    <span className="pl-1">
                                        {job.completedAt
                                            ? dateFormatter(job.completedAt, {
                                                  format: 'longDate',
                                              })
                                            : 'Unknown date'}
                                    </span>
                                </span>
                            </>
                        ) : job.completedAt ? (
                            <>
                                <div
                                    className="flex items-center gap-1"
                                    style={{
                                        color: job.status.hexColor,
                                    }}
                                >
                                    <Clock size={12} strokeWidth={2.3} />
                                    <span className="text-[10px] font-medium leading-4">
                                        Completed{' '}
                                        {dateFormatter(job.completedAt, {
                                            format: 'longDate',
                                        })}
                                    </span>
                                </div>
                                <span className="text-[10px] text-text-subdued italic">
                                    Waiting for payouts
                                </span>
                            </>
                        ) : isJobWaitReview ? (
                            <>
                                <div
                                    className="flex items-center gap-1"
                                    style={{
                                        color: job.status.hexColor,
                                    }}
                                >
                                    <TruckElectricIcon
                                        size={16}
                                        strokeWidth={2.3}
                                    />
                                    <span className="text-xs font-medium leading-4">
                                        Delivering{' '}
                                    </span>
                                </div>
                                <span className="text-[10px] text-text-subdued italic">
                                    Waiting for approve
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-[11px] font-bold text-default-600">
                                    Active Workflow
                                </span>
                                <span className="text-[10px] text-text-subdued italic">
                                    Started {dayjs(job.startedAt).fromNow()}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Segmented Progress Bar (Pill Design) */}
                <div className="flex items-center w-full gap-1.5 sm:gap-2 mb-4">
                    {jobStatuses.map((opt, index) => {
                        const isCompleted = index < activeIndex
                        const isCurrent = index === activeIndex
                        const isPending = index > activeIndex

                        // 1. Current Segment (Glowing Pill)
                        if (isCurrent) {
                            return (
                                <div
                                    key={opt.id}
                                    className="flex items-center justify-center px-4 py-1.5 rounded-full text-white font-bold text-xs sm:text-sm whitespace-nowrap z-10 transition-all duration-300"
                                    style={{
                                        backgroundColor: opt.hexColor,
                                        boxShadow: `0 4px 20px 0 ${opt.hexColor}80`, // Soft glow effect
                                    }}
                                >
                                    {opt.displayName}
                                </div>
                            )
                        }

                        // 2. Completed & Pending Segments (Lines with Tooltips)
                        return (
                            <HeroTooltip
                                key={opt.id}
                                placement="top"
                                showArrow
                                delay={0}
                                closeDelay={0}
                                content={
                                    <div className="px-1 py-1.5 flex flex-col gap-1">
                                        <div className="text-small font-bold flex items-center gap-2">
                                            {/* Small color dot indicator */}
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        opt.hexColor,
                                                }}
                                            />
                                            {opt.displayName}
                                        </div>
                                        <div className="text-tiny text-default-500 font-medium">
                                            {isCompleted
                                                ? '✓ Stage Completed'
                                                : '⏳ Pending Stage'}
                                        </div>
                                    </div>
                                }
                            >
                                <div
                                    className={`flex-1 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                                        isPending
                                            ? 'bg-default-200 dark:bg-default-700 hover:bg-default-300 dark:hover:bg-default-600'
                                            : 'hover:opacity-75'
                                    }`}
                                    style={
                                        isCompleted
                                            ? {
                                                  backgroundColor:
                                                      activeStatus?.hexColor,
                                              }
                                            : {}
                                    }
                                />
                            </HeroTooltip>
                        )
                    })}
                </div>
            </CardBody>
        </Card>
    )
}
