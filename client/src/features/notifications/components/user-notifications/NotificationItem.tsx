import { cn } from '@/lib/utils'
import { NotificationStatusEnum } from '@/shared/enums'
import { TUserNotification } from '@/shared/types'
import { Button, Card, CardBody } from '@heroui/react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
    AlertCircle,
    Briefcase,
    CheckCircle2,
    Info,
    RefreshCcw,
    Rotate3D,
} from 'lucide-react'

dayjs.extend(relativeTime)

type NotificationItemProps = {
    item: TUserNotification
    onRead: (id: string) => void
    onClick: (item: TUserNotification) => void
}

const getIcon = (type: TUserNotification['type']) => {
    switch (type) {
        case 'SUCCESS':
            return <CheckCircle2 className="text-success" size={20} />
        case 'WARNING':
            return <AlertCircle className="text-warning" size={20} />
        case 'ERROR':
            return <AlertCircle className="text-danger" size={20} />
        case 'DEADLINE_REMINDER':
            return <Briefcase className="text-primary" size={20} />
        case 'JOB_UPDATE':
            return <RefreshCcw className="text-primary" size={20} />
        case 'STATUS_CHANGE':
            return <Rotate3D className="text-primary" size={20} />
        default:
            return <Info className="text-primary" size={20} />
    }
}

export const NotificationItem = ({
    item,
    onRead,
    onClick,
}: NotificationItemProps) => {
    const isRead = item.status === NotificationStatusEnum.SEEN

    return (
        <Card
            isPressable
            onPress={() => onClick(item)}
            shadow={isRead ? 'none' : 'md'}
            className={cn(
                'border transition-all duration-200',
                isRead
                    ? 'bg-background/50 border-border-muted hover:bg-background-hovered'
                    : 'bg-background border-border-default hover:shadow-LG'
            )}
        >
            <CardBody className="p-4 flex flex-row gap-4 items-start">
                {/* Icon Wrapper */}
                <div
                    className={cn(
                        'p-2 rounded-full shrink-0',
                        isRead ? 'bg-default-100' : 'bg-primary/10'
                    )}
                >
                    {getIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <h4
                            className={cn(
                                'text-sm font-semibold',
                                isRead
                                    ? 'text-text-subdued'
                                    : 'text-text-default'
                            )}
                        >
                            {item.title}
                        </h4>
                        <span className="text-[10px] text-text-subdued whitespace-nowrap ml-2">
                            {dayjs(item.createdAt).fromNow()}
                        </span>
                    </div>
                    <p
                        className={cn(
                            'text-xs line-clamp-2',
                            isRead ? 'text-text-subdued' : 'text-text-default'
                        )}
                    >
                        {item.content}
                    </p>
                </div>

                {/* Actions */}
                {!isRead && (
                    <div className="flex flex-col gap-2 shrink-0">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            radius="full"
                            onPress={(e) => {
                                // Prevent card click
                                e.continuePropagation()
                                onRead(item.id)
                            }}
                            aria-label="Mark as read"
                        >
                            <div className="w-2 h-2 rounded-full bg-primary" />
                        </Button>
                    </div>
                )}
            </CardBody>
        </Card>
    )
}
