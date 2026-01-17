export const APP_PERMISSIONS = {
    // === CORE MODULES ===
    JOB: {
        READ: 'job.read',
        READ_ALL: 'job.readAll', // Admin: View all jobs
        READ_SENSITIVE: 'job.readSensitive', // Admin: View salary/costs
        CREATE: 'job.create',
        UPDATE: 'job.update',
        DELETE: 'job.delete',
        DELIVER: 'job.deliver',
        PAID: 'job.paid',
        ASSIGN_MEMBER: 'job.assignMember',
        REVIEW: 'job.review', // Manager: Approve/Reject
        PUBLISH: 'job.publish', // Manager: Publish to external
        MANAGE: 'job.manage', // All permission manage
    },

    USER: {
        CREATE: 'user.create',
        UPDATE: 'user.update',
        DELETE: 'user.delete',
        RESET_PASSWORD: 'user.resetPassword',
        BLOCK: 'user.block',
    },

    // === CRM & FINANCE ===
    CLIENT: {
        READ: 'client.read',
        WRITE: 'client.write',
    },
    PAYMENT_CHANNEL: {
        CREATE: 'payment.create',
        UPDATE: 'payment.update',
        DELETE: 'payment.delete',
    },

    // === SOCIAL & COMMUNITY ===
    COMMUNITY: {
        READ: 'community.read',
        CREATE: 'community.create',
        MODERATE: 'community.moderate',
    },
    POST: {
        CREATE: 'post.create',
        DELETE: 'post.delete',
    },

    // === SYSTEM SETTINGS & ASSETS ===
    FILE: {
        READ: 'file.read',
        WRITE: 'file.write',
    },
    DEPARTMENT: {
        READ_SENSITIVE: 'department.readSensitive',
        CREATE: 'department.create',
        UPDATE: 'department.update',
        DELETE: 'department.delete',
    },
    JOB_TITLE: {
        CREATE: 'jobTitle.create',
        UPDATE: 'jobTitle.update',
        DELETE: 'jobTitle.delete',
    },
    JOB_TYPE: {
        CREATE: 'jobType.create',
        UPDATE: 'jobType.update',
        DELETE: 'jobType.delete',
    },
    JOB_STATUS: {
        CREATE: 'jobStatus.create',
        UPDATE: 'jobStatus.update',
        DELETE: 'jobStatus.delete',
    },
    SYSTEM: {
        MANAGE: 'system.manage', // Global configs
    },
    ANALYTICS: {
        READ: 'analytics.read',
        REPORT: 'analytics.report',
    },
    ROLE: {
        MANAGE: 'role.manage',
    },
} as const

/**
 * Helper Type to extract all permission strings as a Union type.
 * Usage: function check(perm: AppPermission) { ... }
 */
export type AppPermission =
    (typeof APP_PERMISSIONS)[keyof typeof APP_PERMISSIONS][keyof (typeof APP_PERMISSIONS)[keyof typeof APP_PERMISSIONS]]
