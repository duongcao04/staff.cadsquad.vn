import type { IUserNotificationResponse } from '../interfaces'

export type TUserNotification = Omit<
    Required<IUserNotificationResponse>,
    'userId' | 'senderId'
>
