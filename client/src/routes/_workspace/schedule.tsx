import { createFileRoute } from '@tanstack/react-router'
import { jobsListOptions } from '../../lib/queries'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_workspace/schedule')({
    component: SchedulePage,
})

export function SchedulePage() {
    // Giả sử bạn lấy dữ liệu từ API jobs nhưng lọc theo task của user hiện tại
    const {
        data: { jobs = [] },
    } = useSuspenseQuery(jobsListOptions({ isAll: '1' }))

    return (
        <div className="size-full">
            {/* DESKTOP VIEW */}
            <div className="hidden lg:block h-full">
                <ScheduleDesktopContent jobs={jobs} />
            </div>

            {/* MOBILE VIEW */}
            <div className="block lg:hidden h-full">
                <UserScheduleMobileContent jobs={jobs} />
            </div>
        </div>
    )
}

import { HeroCard, HeroCardBody, PageHeading } from '@/shared/components'
import { TJob } from '@/shared/types'
import { Clock, Filter } from 'lucide-react'
import { Button, Chip } from '@heroui/react'
import dayjs from 'dayjs'
import UserScheduleMobileContent from '../../features/schedules/components/views/UserScheduleMobileContent'

export const ScheduleDesktopContent = ({ jobs }: { jobs: TJob[] }) => {
    return (
        <>
            <PageHeading
                title="My Schedule"
                // subtitle="Manage your tasks and deadlines"
            />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center bg-content1 p-4 rounded-2xl border border-divider">
                    <div className="flex gap-4">
                        <Button size="sm" variant="flat" color="primary">
                            All Tasks
                        </Button>
                        <Button size="sm" variant="light">
                            Upcoming
                        </Button>
                        <Button size="sm" variant="light">
                            Overdue
                        </Button>
                    </div>
                    <Button
                        size="sm"
                        variant="bordered"
                        startContent={<Filter size={16} />}
                    >
                        Filters
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {jobs.map((job) => (
                        <HeroCard
                            key={job.id}
                            className="hover:border-primary/50 transition-colors"
                        >
                            <HeroCardBody className="flex flex-row items-center justify-between p-5">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-center justify-center bg-default-100 rounded-xl p-3 min-w-16">
                                        <span className="text-xs font-bold text-text-subdued uppercase">
                                            {dayjs(job.dueAt).format('MMM')}
                                        </span>
                                        <span className="text-xl font-black">
                                            {dayjs(job.dueAt).format('DD')}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">
                                            {job.displayName}
                                        </h4>
                                        <div className="flex gap-3 mt-1 text-sm text-text-subdued">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />{' '}
                                                {dayjs(job.dueAt).format(
                                                    'HH:mm A'
                                                )}
                                            </span>
                                            <span>•</span>
                                            <span>{job.client?.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Chip
                                        variant="flat"
                                        color={job.status.hexColor as any}
                                    >
                                        {job.status.displayName}
                                    </Chip>
                                    <Button variant="bordered" size="sm">
                                        View Details
                                    </Button>
                                </div>
                            </HeroCardBody>
                        </HeroCard>
                    ))}
                </div>
            </div>
        </>
    )
}
