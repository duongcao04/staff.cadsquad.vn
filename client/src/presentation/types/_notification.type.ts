import { NotificationStatusEnum, NotificationTypeEnum } from '../enums'
import { TUser } from './_user.type'

export type TUserNotification = {
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
     * @type {string | undefined}
     */
    title?: string

    /**
     * The main content or message of the notification.
     * @type {string}
     */
    content?: string

    /**
     * An optional URL for an image to be displayed in the notification.
     * @type {string | undefined}
     */
    imageUrl?: string

    /**
     * The ID of the user who sent the notification.
     * Can be undefined if it's a system-generated notification.
     * @type {string | undefined}
     */
    senderId?: string

    /**
     * A reference to the User object who sent the notification.
     * @type {User | undefined}
     */
    sender?: TUser

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
    createdAt: Date | string

    /**
     * The timestamp when the notification was last updated.
     * @type {Date}
     */
    updatedAt: Date | string
}

