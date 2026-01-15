import type { IUserResponse } from '../interfaces'

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

export type TUser = Omit<
    Required<IUserResponse>,
    'password' | 'departmentId' | 'jobTitleId'
>

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
