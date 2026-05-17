import {
    cn,
    dateFormatter,
    executeNotificationActionOptions,
    notificationsListOptions,
} from '@/lib'
import HtmlReactParser from '@/shared/components/ui/html-react-parser'
import { NotificationStatusEnum } from '@/shared/enums'
import { TUserNotification, TUserNotificationAction } from '@/shared/types'
import { Avatar, Button, Checkbox } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
    AlertCircleIcon,
    CheckCircle2Icon,
    InfoIcon,
    MessageSquareText,
} from 'lucide-react'

export type NotificationType =
    | 'comment'
    | 'error'
    | 'warning'
    | 'success'
    | 'info'
    | 'review'

export interface NotificationAction {
    label: string
    variant: 'solid' | 'flat' | 'bordered' | 'light'
    color:
        | 'default'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
        | 'danger'
}

export function NotificationCard({
    data,
    isSelected,
    onToggle,
}: {
    data: TUserNotification
    isSelected: boolean
    onToggle: () => void
}) {
    const queryClient = useQueryClient()
    const excuteAction = useMutation(executeNotificationActionOptions)
    const handleAction = (action: TUserNotificationAction) => {
        if (!action.actionKey) {
            return
        }
        excuteAction.mutateAsync(
            {
                id: data.id,
                actionKey: action.actionKey,
            },
            {
                onSuccess() {
                    queryClient.invalidateQueries(notificationsListOptions())
                },
            }
        )
    }

    // Determine the icon based on notification type
    const renderIcon = () => {
        if (data.user?.avatar) {
            return (
                <div className="relative">
                    <Avatar
                        src={data.user.avatar}
                        className="w-8 h-8 text-tiny"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-success-500 rounded-full p-0.5 border border-white">
                        <MessageSquareText size={10} className="text-white" />
                    </div>
                </div>
            )
        }

        switch (data.type) {
            case 'ERROR':
                return <AlertCircleIcon size={24} className="text-danger-500" />
            case 'WARNING':
                return (
                    <AlertCircleIcon size={24} className="text-warning-500" />
                )
            case 'SUCCESS':
                return (
                    <CheckCircle2Icon size={24} className="text-success-500" />
                )
            case 'INFO':
            default:
                return <InfoIcon size={24} className="text-primary-500" />
        }
    }

    return (
        <div
            className={cn(
                'group flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer border',
                data.status === NotificationStatusEnum.SEEN
                    ? 'bg-background border-transparent hover:bg-default-50 hover:border-default-200'
                    : 'bg-default-50 border-default-100',
                isSelected && 'bg-primary-50/50 border-primary-200'
            )}
            onClick={onToggle}
        >
            {/* Checkbox */}
            <div
                className="pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ opacity: isSelected ? 1 : undefined }}
            >
                <Checkbox isSelected={isSelected} onValueChange={onToggle} />
            </div>

            {/* Icon */}
            <div className="pt-1 shrink-0">{renderIcon()}</div>

            {/* Content */}
            <div className="flex flex-col grow min-w-0 gap-1.5">
                {data.title && (
                    <div className="text-sm text-default-900 leading-relaxed">
                        <HtmlReactParser htmlString={data.title} />
                    </div>
                )}

                {data.content && (
                    <div className="text-sm text-default-500 border-l-2 border-default-200 pl-3 py-0.5 my-1 italic">
                        {data.content}
                    </div>
                )}

                {/* Actions */}
                {data.showActions &&
                    data.actions &&
                    data.actions.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            {data.actions.map((act, idx) => {
                                return (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant={act.variant}
                                        color={act.color}
                                        className={cn(
                                            act.variant === 'solid'
                                                ? 'bg-slate-800 text-white font-medium'
                                                : 'font-medium',
                                            act.actionRedirect &&
                                                act.variant === 'solid' &&
                                                'text-white!'
                                        )}
                                        href={act.actionRedirect}
                                        as={
                                            act.actionRedirect ? Link : 'button'
                                        }
                                        onPress={() => handleAction(act)}
                                    >
                                        {act.label}
                                    </Button>
                                )
                            })}
                        </div>
                    )}
            </div>

            {/* Meta (Time & Unread Dot) */}
            <div className="flex flex-col items-end shrink-0 gap-2 min-w-20">
                {data.status === NotificationStatusEnum.UNSEEN && (
                    <div className="w-2 h-2 rounded-full bg-warning-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] mt-1"></div>
                )}
                <span className="text-xs text-default-400 font-medium whitespace-nowrap mt-auto">
                    {dateFormatter(data.createdAt, {
                        format: 'shortMonthDateTime',
                    })}
                </span>
            </div>
        </div>
    )
}
