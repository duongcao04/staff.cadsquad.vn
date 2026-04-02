import { TJob } from '@/shared/types'
import { Card, CardBody, CardHeader, Chip, Divider } from '@heroui/react'
import { Calendar1Icon, CheckCircle2, ClockAlert, Flag } from 'lucide-react'
import { useMemo } from 'react'
import CountdownTimer from '../../../../shared/components/ui/countdown-timer'
import { JobHelper } from '../../../../lib'

export function JobTimelineCard({ job }: { job: TJob }) {
    const timelineData = useMemo(() => {
        const startDate = new Date(job.startedAt)
        const dueDate = new Date(job.dueAt)
        const now = new Date()

        // Calculate differences
        const totalDuration = dueDate.getTime() - startDate.getTime()
        const elapsed = now.getTime() - startDate.getTime()

        const daysRemaining = Math.ceil(
            (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        const isOverdue = daysRemaining < 0

        // Calculate a safe progress percentage for a visual indicator (cap at 100%)
        let progress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0
        progress = Math.max(0, Math.min(progress, 100))

        return {
            startDate: startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            dueDate: dueDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            daysRemaining,
            isOverdue,
            progress,
            // You can check your job.status.systemType here if you want to freeze the timer when completed
            isCompleted:
                job.completedAt != null ||
                job.status?.systemType === 'COMPLETED' ||
                job.status?.systemType === 'DELIVERED',
        }
    }, [job])

    return (
        <Card className="w-full border border-border-default" shadow="none">
            <CardHeader className="bg-background-muted">
                <div className="w-full px-2 py-0 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-text-default uppercase tracking-wider">
                        Timeline
                    </h3>

                    {timelineData.isCompleted ? (
                        <Chip
                            size="sm"
                            color="success"
                            variant="flat"
                            startContent={<CheckCircle2 size={14} />}
                        >
                            Completed
                        </Chip>
                    ) : timelineData.isOverdue ? (
                        <Chip
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<ClockAlert size={14} />}
                        >
                            {Math.abs(timelineData.daysRemaining)} Days Overdue
                        </Chip>
                    ) : (
                        <Chip
                            size="sm"
                            color="warning"
                            variant="flat"
                            startContent={<ClockAlert size={14} />}
                        >
                            {timelineData.daysRemaining} Days Left
                        </Chip>
                    )}
                </div>
            </CardHeader>
            <Divider className="bg-border-muted" />
            <CardBody className="p-5 flex flex-col gap-5">
                {/* Dates Container */}
                <div className="flex items-center justify-between gap-4">
                    {/* Started Date */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-1.5 text-default-500">
                            <Calendar1Icon size={16} />
                            <span className="text-xs font-medium uppercase tracking-wider">
                                Started
                            </span>
                        </div>
                        <span className="text-base font-semibold text-default-900">
                            {timelineData.startDate}
                        </span>
                    </div>

                    {/* Visual Separator / Progress Line */}
                    <div className="hidden sm:flex flex-col w-full justify-center px-4 relative mt-3 space-y-2">
                        {(!JobHelper.isCompleted(job) ||
                            !JobHelper.isFinished(job)) && (
                            <div className="w-full flex items-center justify-center">
                                <CountdownTimer
                                    targetDate={job.dueAt}
                                    hiddenUnits={['second']}
                                    className="text-sm"
                                />
                            </div>
                        )}
                        <div className="h-1.5 w-full bg-default-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                    timelineData.isCompleted
                                        ? 'bg-success'
                                        : timelineData.isOverdue
                                          ? 'bg-danger'
                                          : 'bg-warning'
                                }`}
                                style={{ width: `${timelineData.progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Deadline */}
                    <div className="flex flex-col gap-1 w-full sm:items-end">
                        <div className="flex items-center gap-1.5 text-default-500">
                            <Flag
                                size={16}
                                className={
                                    timelineData.isOverdue &&
                                    !timelineData.isCompleted
                                        ? 'text-danger'
                                        : ''
                                }
                            />
                            <span className="text-xs font-medium uppercase tracking-wider">
                                Deadline
                            </span>
                        </div>
                        <span
                            className={`text-base font-semibold ${timelineData.isOverdue && !timelineData.isCompleted ? 'text-danger' : 'text-default-900'}`}
                        >
                            {timelineData.dueDate}
                        </span>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}
