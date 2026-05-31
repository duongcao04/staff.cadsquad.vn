import type { Department } from './department'
import type { JobTitle } from './jobTitle'
import type { Role } from './role'

export interface User {
    id: string
    displayName: string
    avatar: string
    personalEmail: string | null
    email: string
    username: string
    phoneNumber: string | null
    code: string
    isTwoFactorAuthenticationEnabled: boolean
    department: Department | null
    jobTitle: JobTitle | null
    role: Role
    isActive: boolean
    files: unknown[]
    accounts: unknown[]
    notifications: unknown[]
    configs: unknown[]
    securityLogs: unknown[]
    filesCreated: unknown[]
    jobActivityLog: unknown[]
    jobsCreated: unknown[]
    sendedNotifications: unknown[]
    lastLoginAt: string | Date | null
    createdAt: string | Date
    updatedAt: string | Date
    deletedAt?: Date | null
}
export interface PaginatedUsers {
    users: User[] // Chứa danh sách các User entity (đã được map/parse sạch sẽ)
    total: number // Tổng số lượng user có trong DB
    currentPage: number // Trang hiện tại
    totalPages: number // Tổng số trang
}

export type TUserQueryInput = {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    departmentId?: string
}

export interface UserRepository {
    getUserById(id: string): Promise<User>
    getUsers(params: TUserQueryInput): Promise<User[]>
    findAll(params: TUserQueryInput): Promise<PaginatedUsers>
    findById(id: string): Promise<User>
}

export type UserColumnKey =
    | 'email'
    | 'username'
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

export type UserSecurityLog = {
    id: string
    event: string
    createdAt: string
    ipAddress: string
    status: string
}

export type UserSession = {
    sessionId: string
    userId: string
    device: string
    ipAddress: string
    lastActive: string
}
