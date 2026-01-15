import { isSameDay, parseISO, format } from 'date-fns'
import { HeroCard } from '@/shared/components'
import { TJob } from '@/shared/types'
import { Chip, ScrollShadow } from '@heroui/react'
import { useMemo } from 'react'

type ScheduleListViewProps = {
    currentDate: Date
    jobsSchedule: TJob[]
    onJobClick: (id: string) => void
}
export default function ScheduleListView({
    currentDate,
    jobsSchedule,
    onJobClick,
}: ScheduleListViewProps) {
    // Group jobs by date
    const groupedJobs = useMemo(() => {
        const groups: Record<string, TJob[]> = {}

        // Sort jobs by due date first
        const sortedJobs = [...jobsSchedule].sort(
            (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
        )

        sortedJobs.forEach((job) => {
            const dateKey = format(new Date(job.dueAt), 'yyyy-MM-dd')
            if (!groups[dateKey]) groups[dateKey] = []
            groups[dateKey].push(job)
        })
        return groups
    }, [jobsSchedule])

    const sortedDates = Object.keys(groupedJobs).sort()

    if (sortedDates.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-default-400 bg-content1 rounded-xl border border-border-default">
                No jobs scheduled for {format(currentDate, 'MMMM yyyy')}
            </div>
        )
    }

    return (
        <HeroCard className="flex-1 flex flex-col shadow-sm border border-border-default overflow-hidden h-full">
            <ScrollShadow className="flex-1 p-4 space-y-6">
                {sortedDates.map((dateStr) => {
                    const date = parseISO(dateStr)
                    const jobs = groupedJobs[dateStr]
                    const isToday = isSameDay(date, new Date())

                    return (
                        <div
                            key={dateStr}
                            className="flex flex-col md:flex-row gap-4"
                        >
                            {/* Date Column */}
                            <div className="md:w-32 shrink-0 flex flex-col items-center md:items-start pt-2">
                                <div
                                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border ${isToday ? 'bg-primary text-white border-primary' : 'bg-background border-border-default'}`}
                                >
                                    <span className="text-xl font-bold">
                                        {format(date, 'd')}
                                    </span>
                                    <span
                                        className={`text-xs uppercase font-medium ${isToday ? 'text-white/80' : 'text-default-500'}`}
                                    >
                                        {format(date, 'EEE')}
                                    </span>
                                </div>
                            </div>

                            {/* Jobs List for this Date */}
                            <div className="flex-1 space-y-2">
                                {jobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => onJobClick(job.no)}
                                        className="flex items-center p-3 bg-background rounded-lg border border-border-default hover:border-primary/50 hover:shadow-sm cursor-pointer transition-all group"
                                    >
                                        <div
                                            className="w-1.5 self-stretch rounded-full mr-4"
                                            style={{
                                                backgroundColor:
                                                    job.status?.hexColor ||
                                                    '#ccc',
                                            }}
                                        ></div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                                                    {job.displayName}
                                                </h4>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    className="h-5 text-[10px]"
                                                    style={{
                                                        backgroundColor: `${job.status?.hexColor}20`,
                                                        color: job.status
                                                            ?.hexColor,
                                                    }}
                                                >
                                                    {job.status?.displayName}
                                                </Chip>
                                            </div>
                                            <div className="text-xs text-default-500 flex items-center gap-2">
                                                <span>#{job.no}</span>
                                                <span>•</span>
                                                <span>
                                                    {format(
                                                        new Date(job.dueAt),
                                                        'p'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </ScrollShadow>
        </HeroCard>
    )
}
