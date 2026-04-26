import { ProfileMobileContent } from '@/features/profile'
import JobCard from '@/features/profile/components/JobCard'
import { jobsListOptions, useProfile } from '@/lib/queries'
import { INTERNAL_URLS, JOB_STATUS_CODES } from '@/lib/utils'
import {
    HeroCopyButton,
    PageHeading,
    ScrollArea,
    ScrollBar,
} from '@/shared/components'
import { useDevice } from '@/shared/hooks'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Listbox,
    ListboxItem,
    Tab,
    Tabs,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Image } from 'antd'
import {
    Building2,
    CircleUserRound,
    Mail,
    MessageCircleMore,
    Phone,
    UserRound,
    UserRoundPen,
} from 'lucide-react'
import { optimizeCloudinary } from '../../lib'

export const Route = createFileRoute('/_workspace/profile')({
    head: () => ({
        meta: [
            {
                title: 'Profile',
            },
        ],
    }),
    component: ProfilePage,
})

export default function ProfilePage() {
    const { isSmallView } = useDevice()
    const { profile } = useProfile()

    const [
        {
            data: { jobs: activeJobs },
        },
        {
            data: { jobs: deliveredJobs },
        },
    ] = useSuspenseQueries({
        queries: [
            {
                ...jobsListOptions({
                    status: [
                        JOB_STATUS_CODES.inProgress,
                        JOB_STATUS_CODES.revision,
                    ],
                    isAll: '1',
                }),
            },
            {
                ...jobsListOptions({
                    status: [JOB_STATUS_CODES.delivered],
                    isAll: '1',
                }),
            },
        ],
    })

    // Define the list items to keep the JSX clean
    const overviewItems = [
        {
            key: 'email',
            label: 'Email',
            value: profile?.email,
            href: `mailto:${profile?.email}`,
            icon: Mail,
            copyable: true,
        },
        {
            key: 'chat',
            label: 'Chat',
            value: profile.personalEmail ?? profile.email,
            href: `mailto:${profile?.personalEmail ?? profile?.email}`,
            icon: MessageCircleMore,
            copyable: true,
        },
        {
            key: 'department',
            label: 'Department',
            value: profile.department?.displayName ?? 'N/A',
            icon: Building2,
            copyable: false,
        },
        {
            key: 'jobTitle',
            label: 'Job title',
            value: profile.jobTitle?.displayName ?? 'N/A',
            icon: CircleUserRound,
            copyable: false,
        },
        {
            key: 'phone',
            label: 'Telephone',
            value: profile.phoneNumber ?? '-',
            href: profile.phoneNumber
                ? `tel:${profile.phoneNumber}`
                : undefined,
            icon: Phone,
            copyable: !!profile.phoneNumber,
        },
    ]

    return (
        <>
            <div className="border-b border-border-default">
                <PageHeading
                    title="Profile"
                    classNames={{
                        wrapper: '!py-3 pl-6 pr-3.5',
                    }}
                />
            </div>

            {isSmallView ? (
                <ProfileMobileContent
                    activeJobs={activeJobs}
                    deliveredJobs={deliveredJobs}
                />
            ) : (
                <div className="pl-5 pr-3.5 pt-5">
                    <div className="grid grid-cols-[350px_1fr] gap-3 size-full">
                        {/* PROFILE CARD */}
                        <div>
                            <Card
                                shadow="none"
                                className="border border-border-default h-fit"
                            >
                                <CardHeader className="relative flex flex-col items-center py-6 group">
                                    <div className="absolute hidden group-hover:block top-5 right-5">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            as={Link}
                                            to={INTERNAL_URLS.settings.profile}
                                        >
                                            <UserRoundPen size={16} />
                                        </Button>
                                    </div>
                                    <Image
                                        src={profile.avatar}
                                        preview={false}
                                        alt={profile?.displayName}
                                        rootClassName="size-32! rounded-full!"
                                        className="size-full! rounded-full! object-cover"
                                    />
                                    <h2 className="mt-4 font-bold text-2xl text-text-default!">
                                        {profile?.displayName || '-'}
                                    </h2>
                                    <p className="text-sm font-normal text-text-subdued">
                                        @{profile.username}
                                    </p>
                                </CardHeader>
                                <Divider />
                                <CardBody className="px-1 py-4">
                                    <Tabs
                                        aria-label="Profile options"
                                        size="sm"
                                        fullWidth
                                        variant="bordered"
                                        classNames={{
                                            base: 'px-3',
                                            panel: 'pt-2',
                                        }}
                                    >
                                        <Tab
                                            key="overview"
                                            title={
                                                <div className="flex items-center gap-2">
                                                    <UserRound size={14} />
                                                    <span>Overview</span>
                                                </div>
                                            }
                                        >
                                            <Listbox
                                                aria-label="Profile Overview"
                                                variant="flat"
                                            >
                                                {overviewItems.map((item) => (
                                                    <ListboxItem
                                                        key={item.key}
                                                        textValue={item.label}
                                                        className="h-auto px-3 py-2"
                                                        startContent={
                                                            <item.icon
                                                                size={24}
                                                                className="shrink-0 text-text-subdued"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        }
                                                        endContent={
                                                            item.copyable && (
                                                                <HeroCopyButton
                                                                    textValue={
                                                                        item.value
                                                                    }
                                                                />
                                                            )
                                                        }
                                                    >
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-tiny text-text-subdued">
                                                                {item.label}
                                                            </span>
                                                            {item.href ? (
                                                                <a
                                                                    href={
                                                                        item.href
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-sm font-medium text-text-default hover:underline"
                                                                >
                                                                    {item.value}
                                                                </a>
                                                            ) : (
                                                                <span className="text-sm font-medium text-text-default">
                                                                    {item.value}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </ListboxItem>
                                                ))}
                                            </Listbox>
                                        </Tab>
                                    </Tabs>
                                </CardBody>
                            </Card>
                        </div>

                        {/* JOB OVERVIEW */}
                        <div className="w-full">
                            <Tabs aria-label="Profile tracking jobs">
                                <Tab
                                    key="active"
                                    title={
                                        <p>
                                            <span>Active jobs</span>{' '}
                                            {activeJobs?.length > 0 && (
                                                <span className="text-xs font-bold text-text-subdued">
                                                    ({activeJobs?.length})
                                                </span>
                                            )}
                                        </p>
                                    }
                                >
                                    <Card
                                        shadow="none"
                                        className="border border-border-default"
                                    >
                                        <CardHeader className="px-3 text-text-default">
                                            <p className="text-base font-medium">
                                                Active jobs
                                            </p>
                                        </CardHeader>
                                        <CardBody>
                                            <ScrollArea className="size-full h-[calc(100vh-300px)]">
                                                <ScrollBar orientation="horizontal" />
                                                <ScrollBar orientation="vertical" />
                                                {activeJobs?.length ? (
                                                    <ul className="space-y-4">
                                                        {activeJobs.map(
                                                            (aJob) => {
                                                                return (
                                                                    <JobCard
                                                                        key={
                                                                            aJob.id
                                                                        }
                                                                        data={
                                                                            aJob
                                                                        }
                                                                        // isLoading={
                                                                        //     inprogressLoading ||
                                                                        //     revisionLoading
                                                                        // }
                                                                    />
                                                                )
                                                            }
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-text-subdued">
                                                        <p className="text-base font-medium">
                                                            No active job found.
                                                        </p>
                                                        <p className="text-sm tracking-wide">
                                                            View all job
                                                            <Link
                                                                to={
                                                                    INTERNAL_URLS.projectCenter
                                                                }
                                                                className="link underline! pl-1"
                                                            >
                                                                here
                                                            </Link>
                                                        </p>
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </CardBody>
                                    </Card>
                                </Tab>
                                <Tab
                                    key="waitingResponse"
                                    title={
                                        <p>
                                            <span>Awaiting response</span>{' '}
                                            {deliveredJobs?.length > 0 && (
                                                <span className="text-xs font-bold text-text-subdued">
                                                    {deliveredJobs?.length})
                                                </span>
                                            )}
                                        </p>
                                    }
                                >
                                    <Card
                                        shadow="none"
                                        className="border border-border-default"
                                    >
                                        <CardHeader className="px-3 text-text-default">
                                            <p className="text-base font-medium">
                                                Awaiting response
                                            </p>
                                        </CardHeader>
                                        <CardBody>
                                            <ScrollArea className="size-full">
                                                <ScrollBar orientation="horizontal" />
                                                <ScrollBar orientation="vertical" />

                                                {deliveredJobs?.length ? (
                                                    <ul className="space-y-4">
                                                        {deliveredJobs?.map(
                                                            (aJob) => {
                                                                return (
                                                                    <JobCard
                                                                        key={
                                                                            aJob.id
                                                                        }
                                                                        data={
                                                                            aJob
                                                                        }
                                                                        // isLoading={deliveredLoading}
                                                                    />
                                                                )
                                                            }
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-text-subdued">
                                                        <p className="text-base font-medium">
                                                            No awaiting response
                                                            found.
                                                        </p>
                                                        <p className="text-sm tracking-wide">
                                                            View all jobs
                                                            <Link
                                                                to={
                                                                    INTERNAL_URLS.projectCenter
                                                                }
                                                                className="link underline! pl-1"
                                                            >
                                                                here
                                                            </Link>
                                                        </p>
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </CardBody>
                                    </Card>
                                </Tab>
                            </Tabs>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
