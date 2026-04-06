import { cn, INTERNAL_URLS, useMarkAllSeenMutation } from '@/lib'
import { CHANNELS } from '@/lib/ably'
import { jobsListOptions, useProfile } from '@/lib/queries'
import { workbenchDataOptions } from '@/lib/queries/options/job-queries'
import { notificationsListOptions } from '@/lib/queries/options/notification-queries'
import { queryClient } from '@/main'
import { BellIcon } from '@/shared/components/icons/animate/BellIcon'
import { HeroButton } from '@/shared/components/ui/hero-button'
import { NotificationStatusEnum, NotificationTypeEnum } from '@/shared/enums'
import { TUserNotification } from '@/shared/types'
import {
    addToast,
    Badge,
    Button,
    Chip,
    Popover,
    PopoverContent,
    PopoverTrigger,
    ScrollShadow,
    Spinner,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useChannel } from 'ably/react'
import { CheckCheck, Inbox, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { NotificationCard } from './NotificationCard'

export default function NotificationDropdown() {
    const { profile } = useProfile()
    const router = useRouter()
    const [isOpen, setOpen] = useState(false)

    const { data, isLoading, refetch } = useQuery({
        ...notificationsListOptions(),
        retry: isOpen,
    })

    const markAllSeenMutation = useMarkAllSeenMutation()

    const handleMarkAllSeen = () => {
        markAllSeenMutation.mutateAsync()
    }

    useChannel(
        {
            channelName: CHANNELS.userNotificationsKey(profile.id),
        },
        (message) => {
            refetch()
            const noti: TUserNotification = message.data
            addToast({
                title: noti.title,
                description: noti.content,
                color: 'default',
                classNames: {
                    base: cn([
                        'bg-default-50 dark:bg-background shadow-sm',
                        'border border-l-8 rounded-md rounded-l-none',
                        'flex flex-col items-start',
                        'border-primary-200 dark:border-primary-100 border-l-primary',
                    ]),
                    icon: 'w-6 h-6 fill-current',
                },
                endContent: (
                    <div className="ms-11 my-2 flex gap-x-2">
                        <Button
                            color={'primary'}
                            size="sm"
                            variant="bordered"
                            onPress={() => {
                                router.navigate({
                                    href: noti.redirectUrl ?? '#',
                                })
                            }}
                        >
                            View
                        </Button>
                        <Button
                            className="underline-offset-2"
                            color={'primary'}
                            size="sm"
                            variant="light"
                        >
                            Dismiss
                        </Button>
                    </div>
                ),
            })
            if (message.name === NotificationTypeEnum.JOB_UPDATE) {
                queryClient.refetchQueries({
                    queryKey: [
                        jobsListOptions().queryKey,
                        workbenchDataOptions().queryKey,
                    ],
                })
            }
        }
    )

    const hasUnseen = (data?.unseenCount ?? 0) > 0

    return (
        <Popover
            placement="bottom-end"
            isOpen={isOpen}
            onOpenChange={setOpen}
            offset={10}
        >
            <PopoverTrigger>
                <Button
                    variant="light"
                    size="sm"
                    isIconOnly
                    aria-label="Notifications"
                    className="overflow-visible"
                >
                    {/* Modern Badge Implementation */}
                    <Badge
                        content=""
                        color="danger"
                        shape="circle"
                        isInvisible={!hasUnseen}
                        placement="top-right"
                        className="p-1 border-2 border-background" // Adds a nice cutout effect
                    >
                        <BellIcon size={20} className="text-default-600" />
                    </Badge>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-112.5 p-0 border border-default-100 shadow-medium">
                {/* Header - Sticky & Clean */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-default-100 bg-content1/50 backdrop-blur-md sticky top-0 z-10 rounded-t-medium">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-medium">
                            Notifications
                        </span>
                        {hasUnseen && (
                            <Chip
                                size="sm"
                                color="danger"
                                variant="flat"
                                className="h-5 px-1"
                            >
                                {data?.unseenCount} new
                            </Chip>
                        )}
                    </div>
                    <div className="flex gap-1">
                        <HeroButton
                            size="sm"
                            isIconOnly
                            variant="light"
                            onPress={() => refetch()}
                            className="text-text-subdued"
                            tooltip="Refresh"
                        >
                            <RefreshCcw
                                size={16}
                                className={isLoading ? 'animate-spin' : ''}
                            />
                        </HeroButton>
                        <HeroButton
                            size="sm"
                            isIconOnly
                            variant="light"
                            className="text-text-subdued"
                            tooltip="Mark all as read"
                            onPress={handleMarkAllSeen}
                        >
                            {markAllSeenMutation.isPending ? (
                                <Spinner size="sm" />
                            ) : (
                                <CheckCheck size={18} />
                            )}
                        </HeroButton>
                    </div>
                </div>

                {/* Content Area */}
                <ScrollShadow className="w-full h-150 flex flex-col">
                    {isLoading && !data ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-default-400">
                            <Spinner size="lg" color="current" />
                            <p className="text-small">Loading updates...</p>
                        </div>
                    ) : data?.notifications && data.notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {data.notifications.map((notification, index) => {
                                const isUnseen =
                                    notification.status ===
                                    NotificationStatusEnum.UNSEEN

                                return (
                                    <div
                                        key={notification.id ?? index}
                                        role="button"
                                        tabIndex={0}
                                        className={`
                                                group relative flex w-full cursor-pointer items-start gap-3 p-4 transition-all duration-200 border-b border-divider/50 last:border-none outline-none
                                                hover:bg-default-100 active:scale-[0.99]
                                                ${isUnseen ? 'bg-primary-50/50 dark:bg-primary-50/10' : 'bg-transparent'}
                                            `}
                                        onClick={() => {
                                            router.navigate({
                                                href:
                                                    notification.redirectUrl ??
                                                    '#',
                                            })
                                            setOpen(false)
                                        }}
                                    >
                                        {/* Unseen Indicator Dot */}
                                        {isUnseen && (
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary shadow-sm" />
                                        )}

                                        <div className={isUnseen ? 'pl-2' : ''}>
                                            <NotificationCard
                                                data={notification}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-3">
                            <div className="p-4 rounded-full bg-default-100">
                                <Inbox size={32} />
                            </div>
                            <p className="text-small">No new notifications</p>
                        </div>
                    )}
                </ScrollShadow>

                {/* Footer (Optional) */}
                <div className="w-full p-2 border-t border-default-100 bg-default-50 rounded-b-medium">
                    <Button
                        size="sm"
                        variant="light"
                        fullWidth
                        className="text-text-subdued h-8 font-medium"
                        onPress={() =>
                            router.navigate({
                                href: INTERNAL_URLS.notifications,
                            })
                        }
                    >
                        View all history
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
