import { useMutation, useQuery } from '@tanstack/react-query'

import { notificationApi } from '@/lib/api'
import { axiosClient } from '@/lib/axios'
import { type TCreateNotificationInput } from '@/lib/validationSchemas'

import { queryClient } from '../../main'
import { notificationsListOptions } from './options/notification-queries'

export const useNotifications = () => {
    const options = notificationsListOptions()

    const { data, refetch, error, isFetching, isLoading } = useQuery(options)

    // Data đã được map sẵn trong options.select
    return {
        refetch,
        isLoading: isLoading || isFetching,
        error,
        notifications: data?.notifications ?? [],
        totalCount: data?.totalCount ?? 0,
        unseenCount: data?.unseenCount ?? 0,
    }
}

export const useSendNotificationMutation = () => {
    return useMutation({
        mutationKey: ['createNotification'],
        mutationFn: (sendNotification: TCreateNotificationInput) => {
            return axiosClient.post('notifications/send', sendNotification)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['notifications'],
            })
        },
    })
}

export const useMarkSeenNotification = (onSuccess?: () => void) => {
    return useMutation({
        mutationFn: ({ id }: { id: string }) => notificationApi.markSeen(id),
        onSuccess: () => {
            // invalidate query notifications để refetch dữ liệu mới
            queryClient.refetchQueries({ queryKey: ['notifications'] })
            onSuccess?.()
        },
    })
}
export const useMarkAllSeenMutation = (onSuccess?: () => void) => {
    return useMutation({
        mutationFn: () => notificationApi.markAllSeen(),
        onSuccess: () => {
            // invalidate query notifications để refetch dữ liệu mới
            queryClient.refetchQueries({ queryKey: ['notifications'] })
            onSuccess?.()
        },
    })
}
