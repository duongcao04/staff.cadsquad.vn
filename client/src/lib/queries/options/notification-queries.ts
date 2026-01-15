import { queryOptions } from '@tanstack/react-query'

import { NotificationStatusEnum, NotificationTypeEnum } from '@/shared/enums'
import type { IUserNotificationResponse } from '@/shared/interfaces'
import type { TUserNotification } from '@/shared/types'

import { notificationApi } from '../../api'
import { IMAGES, toDate } from '../../utils'
import { mapUser } from './user-queries'

export const mapUserNotification: (
    item?: IUserNotificationResponse
) => TUserNotification = (item) => ({
    id: item?.id ?? 'N/A',
    user: mapUser(item?.user),
    title: item?.title ?? 'Unknown title',
    content: item?.content ?? '',
    imageUrl: item?.imageUrl ?? IMAGES.loadingPlaceholder,
    sender: item?.sender ?? null,
    redirectUrl: item?.redirectUrl ?? '',
    type: item?.type ?? NotificationTypeEnum.INFO,
    status: item?.status ?? NotificationStatusEnum.UNSEEN,
    createdAt: toDate(item?.createdAt),
    updatedAt: toDate(item?.updatedAt),
})

// --- Query Options ---

// 1. Danh sách notifications
export const notificationsListOptions = () => {
    return queryOptions({
        queryKey: ['notifications'],
        queryFn: () => notificationApi.findAll(),
        select: (res) => {
            const notificationsData = res.result?.notifications
            return {
                notifications: Array.isArray(notificationsData)
                    ? notificationsData.map(mapUserNotification)
                    : [],
                totalCount: res.result?.totalCount ?? 0,
                unseenCount: res.result?.unseenCount ?? 0,
            }
        },
    })
}
