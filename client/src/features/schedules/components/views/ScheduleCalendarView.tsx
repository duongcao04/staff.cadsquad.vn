import { Skeleton } from '@heroui/react'
import {
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
} from 'date-fns'
import { HeroCard } from '@/shared/components'
import { TJob } from '@/shared/types'

type ScheduleCalendarViewProps = {
    currentDate: Date
    jobsSchedule: TJob[]
    onJobClick: (id: string) => void
}
export default function ScheduleCalendarView({
    currentDate,
    jobsSchedule,
    onJobClick,
}: ScheduleCalendarViewProps) {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const getJobsForDay = (date: Date) => {
        return jobsSchedule.filter((job) =>
            isSameDay(new Date(job.dueAt), date)
        )
    }

    return (
        <HeroCard className="flex-1 flex flex-col shadow-sm border border-border-default overflow-hidden h-full">
            <div className="grid grid-cols-7 border-b border-border-default bg-background-muted shrink-0">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-bold text-text-default uppercase"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="flex-1 grid grid-cols-7 bg-background-muted gap-px overflow-y-auto">
                {calendarDays.map((day) => {
                    const isCurrentMonth = isSameMonth(day, monthStart)
                    const isToday = isSameDay(day, new Date())
                    const daysJobs = getJobsForDay(day)

                    return (
                        <div
                            key={day.toISOString()}
                            className={`relative bg-background flex flex-col p-2 min-h-30 transition-colors ${!isCurrentMonth ? 'opacity-40 bg-gray-50' : 'hover:bg-background-hovered'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span
                                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : 'text-text-subdued'}`}
                                >
                                    {format(day, 'd')}
                                </span>
                            </div>
                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-37.5 scrollbar-hide">
                                {daysJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => onJobClick(job.no)}
                                        className="group flex items-center gap-2 p-1.5 rounded-md text-[11px] font-medium cursor-pointer border border-transparent hover:border-border-default hover:shadow-sm transition-all"
                                        style={{
                                            backgroundColor: `${job.status?.hexColor}15`,
                                            color:
                                                job.status?.hexColor ||
                                                '#334155',
                                            borderLeft: `3px solid ${job.status?.hexColor}`,
                                        }}
                                    >
                                        <span className="truncate flex-1">
                                            {job.displayName}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </HeroCard>
    )
}
export function CalendarSkeleton() {
    return (
        <div className="flex flex-col h-full animate-pulse">
            <div className="flex justify-between mb-6">
                <Skeleton className="w-48 h-10 rounded-xl" />
                <Skeleton className="w-32 h-10 rounded-xl" />
            </div>
            <HeroCard className="flex-1 border border-border-default">
                <div className="grid grid-cols-7 border-b border-border-default h-12">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="p-3">
                            <Skeleton className="h-4 w-full rounded-md" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 h-full gap-px bg-border-default">
                    {[...Array(35)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-background p-2 min-h-32 space-y-2"
                        >
                            <Skeleton className="w-6 h-6 rounded-full" />
                            <Skeleton className="w-full h-4 rounded-md" />
                            <Skeleton className="w-4/5 h-4 rounded-md" />
                        </div>
                    ))}
                </div>
            </HeroCard>
        </div>
    )
}
