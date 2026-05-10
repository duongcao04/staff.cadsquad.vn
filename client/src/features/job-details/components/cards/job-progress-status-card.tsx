import { DeliverJobModal } from '@/features/job-manage'
import { APP_PERMISSIONS, jobByNoOptions, jobStatusesListOptions } from '@/lib'
import JobFinishChip from '@/shared/components/chips/JobFinishChip'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { PermissionGuard } from '@/shared/guards/permission'
import { TJob } from '@/shared/types'
import { Button, Card, CardBody, Tooltip, useDisclosure } from '@heroui/react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { useMemo } from 'react'

export const JobProgressStatusCard = ({ job }: { job: TJob }) => {
    const diliverModalState = useDisclosure()

    const queryClient = useQueryClient()

    const {
        data: { jobStatuses },
    } = useSuspenseQuery(jobStatusesListOptions())

    const activeIndex = useMemo(() => {
        if (!jobStatuses.length) return 0
        const index = jobStatuses.findIndex((s) => s.id === job?.status.id)
        return index !== -1 ? index : 0
    }, [job?.status.id, jobStatuses])

    const activeStatus = useMemo(() => {
        return jobStatuses[activeIndex] || job?.status
    }, [activeIndex, jobStatuses, job?.status])

    const isJobCompleted = useMemo(
        () => job?.status?.systemType === JobStatusSystemTypeEnum.COMPLETED,
        [job?.status]
    )
    const isJobFinished = useMemo(
        () => job?.status?.systemType === JobStatusSystemTypeEnum.TERMINATED,
        [job?.status]
    )

    const isPaused = isJobFinished || isJobCompleted

    const canDeliver = useMemo(
        () =>
            !isPaused &&
            job?.status?.systemType !== JobStatusSystemTypeEnum.DELIVERED,
        [job?.status]
    )

    const handleDeliverSuccess = () => {
        queryClient.invalidateQueries(jobByNoOptions(job.no))
    }

    return (
        <>
            {canDeliver && diliverModalState.isOpen && !!job && (
                <DeliverJobModal
                    isOpen={diliverModalState.isOpen}
                    onClose={diliverModalState.onClose}
                    showSelect={false}
                    defaultJob={job}
                    onSuccess={handleDeliverSuccess}
                />
            )}
            <Card
                shadow="none"
                className="mb-6 overflow-hidden border border-border-default rounded-xl"
            >
                <CardBody className="p-4">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        {/* 1. Status Info & Date Info */}
                        <div className="flex flex-col gap-1 min-w-50 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-text-subdued tracking-widest">
                                    Current Status
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{
                                        backgroundColor:
                                            job.status?.hexColor ||
                                            'var(--nextui-colors-default-400)',
                                    }}
                                />
                                <h3
                                    className="text-lg font-black leading-none"
                                    style={{
                                        color:
                                            job.status?.hexColor || 'inherit',
                                    }}
                                >
                                    {job.status?.displayName ||
                                        'Unknown Status'}
                                </h3>
                            </div>
                        </div>

                        {/* 2. Segmented Progress Bar */}
                        <div className="flex-1 w-full items-center gap-1.5 px-4 hidden sm:flex">
                            {jobStatuses.map((opt, index) => {
                                const isCompleted = index < activeIndex
                                const isCurrent = index === activeIndex
                                const isPending = index > activeIndex

                                if (isCurrent) {
                                    return (
                                        <div
                                            key={opt.id}
                                            className="z-10 flex items-center justify-center px-3 py-1 text-xs font-bold text-white rounded-full shadow-sm whitespace-nowrap"
                                            style={{
                                                backgroundColor: opt.hexColor,
                                            }}
                                        >
                                            {opt.displayName}
                                        </div>
                                    )
                                }

                                return (
                                    <Tooltip
                                        key={opt.id}
                                        placement="top"
                                        content={
                                            <div className="px-1 py-1.5 flex flex-col gap-1">
                                                <div className="flex items-center gap-2 font-bold text-small">
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                opt.hexColor,
                                                        }}
                                                    />
                                                    {opt.displayName}
                                                </div>
                                                <div className="font-medium text-tiny text-default-500">
                                                    {isCompleted
                                                        ? '✓ Stage Completed'
                                                        : '⏳ Pending Stage'}
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div
                                            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                                                isPending
                                                    ? 'bg-default-100 hover:bg-default-200'
                                                    : 'opacity-50 hover:opacity-100'
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
                                    </Tooltip>
                                )
                            })}
                        </div>

                        {/* 3. Deliver Action Button */}
                        <div className="flex items-center gap-3 shrink-0">
                            {isPaused ? (
                                <JobFinishChip
                                    status={
                                        isJobCompleted ? 'completed' : 'finish'
                                    }
                                />
                            ) : canDeliver ? (
                                <PermissionGuard
                                    permission={APP_PERMISSIONS.JOB.DELIVER}
                                >
                                    <Tooltip
                                        placement="top-end"
                                        content={
                                            <div className="px-1 py-1.5 max-w-50">
                                                <p className="mb-1 font-bold text-small">
                                                    Ready to Deliver?
                                                </p>
                                                <p className="text-tiny text-default-500">
                                                    Ensure all required assets
                                                    and documents are uploaded
                                                    to SharePoint before
                                                    submitting.
                                                </p>
                                            </div>
                                        }
                                    >
                                        <Button
                                            size="sm"
                                            color="primary"
                                            variant="solid"
                                            startContent={
                                                <CheckCircle2 size={16} />
                                            }
                                            className="font-bold shadow-sm"
                                            onPress={diliverModalState.onOpen}
                                        >
                                            Deliver Job
                                        </Button>
                                    </Tooltip>
                                </PermissionGuard>
                            ) : null}
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}
