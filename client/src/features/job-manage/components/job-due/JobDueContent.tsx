import { JobCardSkeleton } from '@/features/profile'
import { dateFormatter } from '@/lib/dayjs'
import { profileScheduleOptions } from '@/lib/queries'
import {
    HeroModalBody,
    HeroModalHeader,
    ScrollArea,
    ScrollBar,
} from '@/shared/components'
import { Skeleton } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import JobCard from '../../../profile/components/JobCard'

export function JobDueContent({
    currentDate,
    onClose,
}: {
    currentDate: Date
    onClose: () => void
}) {
    const {
        data: { jobsSchedule },
    } = useSuspenseQuery(
        profileScheduleOptions(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1, // Fix: Tháng thường là 1-12
            currentDate.getDate() // Fix: .getDate() cho ngày trong tháng, không phải .getDay()
        )
    )

    return (
        <>
            <HeroModalHeader>
                <div className="space-y-1">
                    <p className="text-lg font-medium">
                        Upcoming tasks
                        <span className="ml-2 text-base text-text-subdued">
                            ({jobsSchedule?.length ?? 0})
                        </span>
                    </p>
                    <p className="text-sm flex items-center gap-2">
                        <CalendarDays size={16} className="text-text-subdued" />
                        <span>
                            {dateFormatter(currentDate, { format: 'longDate' })}
                        </span>
                    </p>
                </div>
            </HeroModalHeader>
            <HeroModalBody>
                <ScrollArea className="size-full">
                    <div className="min-w-full w-fit py-5 space-y-5 border-t border-border max-h-125">
                        {jobsSchedule?.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-subdued text-center">
                                <p className="text-base font-medium">
                                    Empty tasks for today.
                                </p>
                                <p className="text-sm">
                                    View all jobs{' '}
                                    <a
                                        href="/project-center/active"
                                        className="underline font-medium"
                                    >
                                        here
                                    </a>
                                </p>
                            </div>
                        ) : (
                            jobsSchedule?.map((job) => (
                                <JobCard
                                    key={job.id}
                                    data={job}
                                    onPress={onClose}
                                />
                            ))
                        )}
                    </div>
                    <ScrollBar orientation="vertical" />
                </ScrollArea>
            </HeroModalBody>
        </>
    )
}

export function JobDueSkeleton({ currentDate }: { currentDate: Date }) {
    return (
        <div className="animate-pulse">
            <HeroModalHeader>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-32 h-6 rounded-md" />
                        <Skeleton className="w-8 h-4 rounded-md" />
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-default-200" />
                        <span className="text-sm text-default-300">
                            {dateFormatter(currentDate, { format: 'longDate' })}
                        </span>
                    </div>
                </div>
            </HeroModalHeader>
            <HeroModalBody>
                <ScrollArea className="size-full">
                    <div className="py-5 space-y-5 border-t border-border">
                        {[...Array(3)].map((_, i) => (
                            <JobCardSkeleton key={i} />
                        ))}
                    </div>
                </ScrollArea>
            </HeroModalBody>
        </div>
    )
}
