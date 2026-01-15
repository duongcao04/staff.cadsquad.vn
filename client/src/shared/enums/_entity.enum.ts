export enum EntityEnum {
    // Core Modules
    JOB = 'JOB',
    USER = 'USER',
    ROLE = 'ROLE',
    PERMISSION = 'PERMISSION',

    // CRM / Business
    CLIENT = 'CLIENT',
    PAYMENT_CHANNEL = 'PAYMENT_CHANNEL',
    DEPARTMENT = 'DEPARTMENT',
    JOB_TITLE = 'JOB_TITLE',

    // Social / Community
    COMMUNITY = 'COMMUNITY',
    TOPIC = 'TOPIC',
    POST = 'POST',
    COMMENT = 'COMMENT', // Covers JobComment and potential future Post comments

    // Assets & System
    FILE = 'FILE', // FileSystem
    NOTIFICATION = 'NOTIFICATION',
    SYSTEM = 'SYSTEM', // For configs, logs, maintenance
    ANALYTICS = 'ANALYTICS', // For dashboard/reports viewing
}
