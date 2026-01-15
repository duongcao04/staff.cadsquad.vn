import { NotificationStatusEnum, NotificationTypeEnum } from '@/shared/enums'

import type { TUser } from '../types'

/**
 * Represents a notification sent to a user.
 * Notifications can be of various types and have different statuses (e.g., seen, unseen).
 */
export interface IUserNotificationResponse {
    /**
     * The unique identifier for the notification.
     * @type {string}
     */
    id?: string

    /**
     * The ID of the user who will receive the notification.
     * @type {string}
     */
    userId?: string

    /**
     * A reference to the User object who is the recipient of the notification.
     * @type {User}
     */
    user?: TUser

    /**
     * The title of the notification.
     * @type {string | null | undefined}
     */
    title?: string | null

    /**
     * The main content or message of the notification.
     * @type {string}
     */
    content?: string

    /**
     * An optional URL for an image to be displayed in the notification.
     * @type {string | null | undefined}
     */
    imageUrl?: string | null

    /**
     * The ID of the user who sent the notification.
     * Can be null if it's a system-generated notification.
     * @type {string | null | undefined}
     */
    senderId?: string | null

    /**
     * A reference to the User object who sent the notification.
     * @type {User | null | undefined}
     */
    sender?: TUser | null

    /**
     * A url for redirect action
     * @type {string | null | undefined}
     */
    redirectUrl?: string | null

    /**
     * The type of the notification (e.g., INFO, WARNING, JOB_UPDATE).
     * @type {NotificationTypeEnum}
     */
    type?: NotificationTypeEnum

    /**
     * The current status of the notification (e.g., SEEN, UNSEEN).
     * @type {NotificationStatusEnum}
     */
    status?: NotificationStatusEnum

    /**
     * The timestamp when the notification was created.
     * @type {Date}
     */
    createdAt?: Date

    /**
     * The timestamp when the notification was last updated.
     * @type {Date}
     */
    updatedAt?: Date
}
