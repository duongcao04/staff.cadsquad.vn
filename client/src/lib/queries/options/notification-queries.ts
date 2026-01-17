import { notificationApi } from '@/lib/api'
import { IMAGES, toDate } from '@/lib/utils'
import { NotificationStatusEnum, NotificationTypeEnum } from '@/shared/enums'
import type { IUserNotificationResponse } from '@/shared/interfaces'
import type { TUserNotification } from '@/shared/types'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { mapUser } from './user-queries'

export const mapUserNotification: (
    item?: IUserNotificationResponse
) => TUserNotification = (item) => ({
    id: item?.id || 'N/A',
    user: mapUser(item?.user),
    title: item?.title || 'Unknown title',
    content: item?.content || '',
    imageUrl: item?.imageUrl || IMAGES.cadsquadLogoOrange,
    sender: item?.sender || null,
    redirectUrl: item?.redirectUrl || '',
    type: item?.type || NotificationTypeEnum.INFO,
    status: item?.status || NotificationStatusEnum.UNSEEN,
    createdAt: toDate(item?.createdAt),
    updatedAt: toDate(item?.updatedAt),
})

// --- Query Options ---

// 1. Danh sách notifications
export const notificationsListOptions = (paginations?: {
    page?: number
    limit?: number
}) => {
    return queryOptions({
        queryKey: ['notifications'],
        queryFn: () =>
            notificationApi.findAll(
                paginations?.page ?? 1,
                paginations?.limit ?? 20
            ),
        select: (res) => {
            const notificationsData = res.result?.notifications
            return {
                notifications: Array.isArray(notificationsData)
                    ? notificationsData.map(mapUserNotification)
                    : [],
                totalCount: res.result?.totalCount || 0,
                unseenCount: res.result?.unseenCount || 0,
            }
        },
    })
}

export const notificationsInfiniteOptions = (limit: number = 20) => {
    return infiniteQueryOptions({
        // Include 'infinite' and 'limit' in key to separate from standard list cache
        queryKey: ['notifications', 'infinite', { limit }],
        initialPageParam: 1,
        
        queryFn: async ({ pageParam }) => {
            const res = await notificationApi.findAll(
                pageParam as number, 
                limit
            )

            // Map data immediately so 'lastPage' is clean in getNextPageParam
            const notificationsData = res.result?.notifications
            return {
                notifications: Array.isArray(notificationsData)
                    ? notificationsData.map(mapUserNotification)
                    : [],
                totalCount: res.result?.totalCount || 0,
                unseenCount: res.result?.unseenCount || 0,
                // Return current page to easily calculate next page
                currentPage: pageParam as number, 
            }
        },

        getNextPageParam: (lastPage, allPages) => {
            // Calculate total items currently loaded in the cache
            const loadedCount = allPages.flatMap((p) => p.notifications).length

            // If we haven't loaded all items yet, return next page index
            if (loadedCount < lastPage.totalCount) {
                return lastPage.currentPage + 1
            }
            
            return undefined
        },
    })
}