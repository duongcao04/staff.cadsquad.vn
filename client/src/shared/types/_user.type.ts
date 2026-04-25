import { TDepartment } from './_department.type'
import { TJobTitle } from './_job-title.type'
import { TRole } from './_role.type'

export interface TUser {
    id: string
    displayName: string
    avatar: string
    personalEmail: string | null
    email: string
    username: string
    phoneNumber: string | null
    code: string

    department: TDepartment | null
    jobTitle: TJobTitle | null
    role: TRole

    isActive: boolean

    // Arrays
    files: any[]
    accounts: any[]
    notifications: any[]
    configs: any[]
    securityLogs: any[]
    filesCreated: any[]
    jobActivityLog: any[]
    jobsCreated: any[]
    sendedNotifications: any[]

    // Dates
    lastLoginAt: string | Date | null
    createdAt: string | Date
    updatedAt: string | Date
    deletedAt?: Date | null | undefined
}

/**
 * Example of a user-related type.
 * Represents a summary of a user, containing only essential information.
 *
 * @example
 * const userSummary: UserSummary = {
 *   id: "123-abc",
 *   displayName: "John Doe",
 *   avatar: "https://example.com/avatar.png"
 * };
 */
export type UserSummary = {
    /** The unique identifier of the user. */
    id: string

    /** The name to be displayed for the user. */
    displayName: string

    /** An optional URL to the user's avatar image. */
    avatar?: string
}

export type UserColumnKey =
    | 'email'
    | 'username'
    | 'displayName'
    | 'displayName'
    | 'avatar'
    | 'jobTitle'
    | 'department'
    | 'phoneNumber'
    | 'role'
    | 'isActive'
    | 'lastLoginAt'
    | 'jobsAssigned'
    | 'accounts'
    | 'createdAt'
    | 'updatedAt'
    | 'action'

export type TUserSecurityLog = {
    id: string
    event: string
    createdAt: string
    ipAddress: string
    status: string
}

export type TUserSession = {
    sessionId: string
    userId: string
    device: string
    ipAddress: string
    lastActive: string
}
