import { INTERNAL_URLS } from '@/lib/utils'
import { TJob } from '@/shared/types'
import { Tab, Tabs } from '@heroui/react'
import { Link } from '@tanstack/react-router'
import JobCard from './JobCard'
import { ProfileCard } from './ProfileCard'

interface ProfileMobileContentProps {
    activeJobs: TJob[]
    deliveredJobs: TJob[]
}

export const ProfileMobileContent = ({
    activeJobs,
    deliveredJobs,
}: ProfileMobileContentProps) => {
    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* PROFILE CARD - Full width on top */}
            <section className="px-4">
                <ProfileCard />
            </section>

            {/* JOB TRACKING TABS */}
            <section className="flex flex-col">
                <Tabs
                    aria-label="Profile tracking jobs"
                    variant="underlined"
                    classNames={{
                        base: 'w-full px-4',
                        tabList: 'w-full border-b border-divider p-0 gap-6',
                        cursor: 'w-full bg-primary',
                        tab: 'max-w-fit px-0 h-12',
                        tabContent:
                            'group-data-[selected=true]:font-bold text-sm',
                    }}
                >
                    <Tab
                        key="active"
                        title={
                            <div className="flex items-center gap-2">
                                <span>Active</span>
                                <span className="text-text-subdued font-medium text-xs">
                                    ({activeJobs?.length || 0})
                                </span>
                            </div>
                        }
                    >
                        <div className="mt-4 px-2">
                            {activeJobs?.length ? (
                                <ul className="space-y-3">
                                    {activeJobs.map((job) => (
                                        <JobCard key={job.id} data={job} />
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState message="No active job found." />
                            )}
                        </div>
                    </Tab>

                    <Tab
                        key="waitingResponse"
                        title={
                            <div className="flex items-center gap-2">
                                <span>Awaiting</span>
                                <span className="text-text-subdued font-medium text-xs">
                                    ({deliveredJobs?.length || 0})
                                </span>
                            </div>
                        }
                    >
                        <div className="mt-4 px-2">
                            {deliveredJobs?.length ? (
                                <ul className="space-y-3">
                                    {deliveredJobs.map((job) => (
                                        <JobCard key={job.id} data={job} />
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState message="No awaiting response found." />
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </section>
        </div>
    )
}

const EmptyState = ({ message }: { message: string }) => (
    <div className="py-16 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="p-4 rounded-full bg-default-100">
            <p className="text-sm font-semibold text-text-muted">{message}</p>
        </div>
        <p className="text-xs text-text-subdued">
            You can track your work or view all projects{' '}
            <Link
                to={INTERNAL_URLS.projectCenter}
                className="text-primary font-bold underline"
            >
                here
            </Link>
        </p>
    </div>
)
