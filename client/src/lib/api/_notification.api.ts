import { type ApiResponse, axiosClient } from '@/lib/axios'
import type { TCreateNotificationInput } from '@/lib/validationSchemas'
import type { IUserNotificationResponse } from '@/shared/interfaces'

export const notificationApi = {
    create: (data: TCreateNotificationInput) => {
        return axiosClient.post<ApiResponse<IUserNotificationResponse>>(
            '/v1/notifications',
            data
        )
    },
    // Get all user notification
    // userId get from Authentication Header
    findAll: async (page: number, limit: number) => {
        return axiosClient
            .get<
                ApiResponse<{
                    notifications: IUserNotificationResponse[]
                    totalCount: number
                    unseenCount: number
                }>
            >(`/v1/notifications?page=${page}&limit=${limit}`)
            .then((res) => res.data)
    },
    findOne: (id: string) => {
        return axiosClient.get<ApiResponse<IUserNotificationResponse>>(
            `/v1/notifications/${id}`
        )
    },
    markSeen: (id: string) => {
        return axiosClient.patch<ApiResponse<{ id: string }>>(
            `/v1/notifications/${id}/seen`
        )
    },
    markAllSeen: () => {
        return axiosClient.patch(`/v1/notifications/mark-all-seen`)
    },
    remove: (id: string) => {
        return axiosClient.delete(`/v1/notifications/${id}`)
    },
}
