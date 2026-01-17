import { useMarkAllSeenMutation, useMarkSeenNotification } from '@/lib'
import { TUserNotification } from '@/shared/types'
import { Button, Spinner } from '@heroui/react'
import { BellOff, CheckCheck } from 'lucide-react'
import { NotificationItem } from './NotificationItem'
import { NotificationStatusEnum } from '../../../../shared/enums'
import { useRouter } from '@tanstack/react-router'

type NotificationListProps = {
    data: TUserNotification[]
    isLoading: boolean
}

export const NotificationList = ({
    data,
    isLoading,
}: NotificationListProps) => {
    const router = useRouter()
    const markAllSeenMutation = useMarkAllSeenMutation()
    const markSeenNotification = useMarkSeenNotification()

    const handleMarkAllSeen = () => {
        markAllSeenMutation.mutateAsync()
    }
    const handleMarkAsSeen = (notiId: string) => {
        markSeenNotification.mutateAsync({
            id: notiId,
        })
    }

    const handleClick = (item: TUserNotification) => {
        if (item.status === NotificationStatusEnum.UNSEEN)
            handleMarkAsSeen(item.id)
        if (item.redirectUrl) {
            router.navigate({
                href: item.redirectUrl,
                hashScrollIntoView: true,
            })
        }
    }

    if (isLoading && data.length === 0) {
        return (
            <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
                <Spinner
                    size="lg"
                    color="primary"
                    label="Loading notifications..."
                />
            </div>
        )
    }

    if (!isLoading && data.length === 0) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center text-text-subdued gap-2">
                <BellOff size={48} className="opacity-20" />
                <p>No notifications yet</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full pb-10">
            <div className="flex justify-end px-1">
                <Button
                    size="sm"
                    variant="light"
                    startContent={<CheckCheck size={14} />}
                    className="text-text-subdued hover:text-primary"
                    onPress={handleMarkAllSeen}
                >
                    Mark all as read
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                {data.map((item) => (
                    <NotificationItem
                        key={item.id}
                        item={item}
                        onRead={handleMarkAsSeen}
                        onClick={handleClick}
                    />
                ))}
            </div>
        </div>
    )
}
