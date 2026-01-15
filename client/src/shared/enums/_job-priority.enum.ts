export const JobPriorityEnum = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
} as const
export type JobPriorityEnum =
    (typeof JobPriorityEnum)[keyof typeof JobPriorityEnum]
