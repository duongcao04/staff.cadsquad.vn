export const ActivityTypeEnum = {
    CREATE_JOB: 'CREATE_JOB',
    // Member
    ASSIGN_MEMBER: 'ASSIGN_MEMBER',
    UNASSIGN_MEMBER: 'UNASSIGN_MEMBER',
    UPDATE_MEMBER_COST: 'UPDATE_MEMBER_COST',
    // WorkFlow
    FORCE_CHANGE_STATUS: 'FORCE_CHANGE_STATUS',
    DELIVER: 'DELIVER',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    // Financial
    PAID: 'PAID',
    // INFO
    UPDATE_ATTACHMENTS: 'UPDATE_ATTACHMENTS',
    UPDATE_GENERAL_INFORMATION: 'UPDATE_GENERAL_INFORMATION',
    // Client
    UPDATE_CLIENT_INFORMATION: 'UPDATE_CLIENT_INFORMATION',
    // Schedule
    RESCHEDULE: 'RESCHEDULE',
    // Danger
    DELETE: 'DELETE',
    // Private
    PRIVATE: 'PRIVATE',
} as const
export type ActivityTypeEnum =
    (typeof ActivityTypeEnum)[keyof typeof ActivityTypeEnum]
