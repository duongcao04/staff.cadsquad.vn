import type {
    TAccount,
    TDepartment,
    TJob,
    TJobActivityLog,
    TJobTitle,
    TRole,
    TUserConfig,
    TUserSecurityLog,
} from '@/shared/types'

/**
 * Represents a user entity with profile details, relations,
 * and metadata about their activity in the system.
 */
export interface IUserResponse {
    /** Unique identifier (UUIDv4) */
    id?: string

    /** Unique email address */
    email?: string

    /** Personal email address */
    personalEmail?: string | null

    /** Unique username */
    username?: string

    /** Display name for the user profile */
    displayName?: string

    /** Encrypted password */
    password?: string

    /** Avatar URL (nullable) */
    avatar?: string

    /** Job title information (nullable) */
    jobTitleId?: string | null

    securityLogs?: TUserSecurityLog[]

    /** Job title information (nullable) */
    jobTitle?: TJobTitle | null

    /** Department ID (nullable) */
    departmentId?: string | null

    /** Department information (nullable) */
    department?: TDepartment | null

    /** Phone number (nullable) */
    phoneNumber?: string | null

    // /** User role (e.g., ADMIN, USER) */
    // role?: RoleEnum

    /** Indicates if the user account is active */
    isActive?: boolean

    /** Last login date and time (nullable) */
    lastLoginAt?: Date | null

    /** List of notifications received by the user */
    notifications?: Notification[]

    /** List of jobs created by the user */
    jobsCreated?: TJob[]

    /** List of files created by the user */
    filesCreated?: FileSystem[]

    /** List of files associated with the user */
    files?: FileSystem[]

    /** Connected accounts (e.g., Google, GitHub) */
    accounts?: TAccount[]

    role: TRole

    /** Notifications sent by the user */
    sendedNotifications?: Notification[]

    /** Log of job-related activities performed by the user */
    jobActivityLog?: TJobActivityLog[]

    /** Personal configuration settings for the user */
    configs?: TUserConfig[]

    /** Date and time when the user was created */
    createdAt?: Date | string

    /** Date and time when the user was last updated */
    updatedAt?: Date | string
}
