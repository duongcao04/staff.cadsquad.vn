export const NotificationStatusEnum = {
    SEEN: 'SEEN',
    UNSEEN: 'UNSEEN',
}
export type NotificationStatusEnum =
    (typeof NotificationStatusEnum)[keyof typeof NotificationStatusEnum]
