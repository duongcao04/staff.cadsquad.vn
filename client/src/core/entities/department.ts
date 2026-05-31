import type { User } from './user'

export interface Department {
    id: string
    code: string
    displayName: string
    users: User[]
    hexColor: string | null
    notes: string | null
    createdAt: string | Date
    updatedAt: string | Date
    _count: {
        users?: number
    }
}
