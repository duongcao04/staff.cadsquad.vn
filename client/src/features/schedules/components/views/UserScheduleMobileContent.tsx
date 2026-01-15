import { Avatar, Button, Chip, Divider } from '@heroui/react'
import {
    CalendarIcon,
    ChevronRight,
    MapPin,
    MoreHorizontal,
} from 'lucide-react'
import { TJob } from '@/shared/types'
import dayjs from 'dayjs'

export default function UserScheduleMobileContent({ jobs }: { jobs: TJob[] }) {
    // Nhóm jobs theo ngày
    const groupedJobs = jobs.reduce(
        (acc, job) => {
            const date = dayjs(job.dueAt).format('YYYY-MM-DD')
            if (!acc[date]) acc[date] = []
            acc[date].push(job)
            return acc
        },
        {} as Record<string, TJob[]>
    )

    return (
        <div className="pb-24">
            {/* Mobile Header */}
            <div className="p-5 pt-8 space-y-2">
                <h1 className="text-3xl font-black tracking-tight">
                    Today's Tasks
                </h1>
                <p className="text-text-subdued text-sm font-medium">
                    You have {jobs.length} items scheduled for this week.
                </p>
            </div>

            <div className="px-5 space-y-8 mt-4">
                {Object.entries(groupedJobs).map(([date, dayJobs]) => (
                    <div key={date} className="space-y-4">
                        {/* Date Divider */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-primary whitespace-nowrap">
                                {dayjs(date).isSame(dayjs(), 'day')
                                    ? 'Today'
                                    : dayjs(date).format('ddd, MMM DD')}
                            </span>
                            <Divider className="flex-1 opacity-50" />
                        </div>

                        {/* Timeline Items */}
                        <div className="space-y-4">
                            {dayJobs.map((job) => (
                                <div key={job.id} className="flex gap-4 group">
                                    {/* Time side */}
                                    <div className="flex flex-col items-end pt-1 min-w-12">
                                        <span className="text-xs font-bold">
                                            {dayjs(job.dueAt).format('HH:mm')}
                                        </span>
                                        <span className="text-[10px] text-text-subdued font-medium">
                                            AM
                                        </span>
                                    </div>

                                    {/* Card content */}
                                    <div
                                        className="flex-1 bg-white dark:bg-content1 p-4 rounded-[2rem] border border-divider shadow-sm active:scale-[0.98] transition-transform"
                                        onClick={() => {
                                            /* Navigate to detail */
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <Chip
                                                size="sm"
                                                variant="dot"
                                                className="border-none bg-default-100 font-bold text-[10px]"
                                            >
                                                {job.type?.displayName}
                                            </Chip>
                                            <Button
                                                isIconOnly
                                                variant="light"
                                                size="sm"
                                                radius="full"
                                            >
                                                <MoreHorizontal size={16} />
                                            </Button>
                                        </div>

                                        <h3 className="font-bold text-base leading-tight mb-2">
                                            {job.displayName}
                                        </h3>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex -space-x-2">
                                                {job.assignments?.map((a) => (
                                                    <Avatar
                                                        key={a.id}
                                                        src={a.user.avatar}
                                                        className="w-7 h-7 border-2 border-white dark:border-black"
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1 text-primary">
                                                <span className="text-xs font-bold">
                                                    Details
                                                </span>
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Action Button for Mobile */}
            <div className="fixed bottom-6 right-6">
                <Button
                    color="primary"
                    isIconOnly
                    radius="full"
                    size="lg"
                    className="shadow-2xl shadow-primary/40 h-14 w-14"
                >
                    <CalendarIcon size={24} />
                </Button>
            </div>
        </div>
    )
}
