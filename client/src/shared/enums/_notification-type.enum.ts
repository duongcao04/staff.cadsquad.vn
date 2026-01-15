export const NotificationTypeEnum = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
    JOB_UPDATE: 'JOB_UPDATE',
    DEADLINE_REMINDER: 'DEADLINE_REMINDER',
    STATUS_CHANGE: 'STATUS_CHANGE',
} as const
export type NotificationTypeEnum =
    (typeof NotificationTypeEnum)[keyof typeof NotificationTypeEnum]
