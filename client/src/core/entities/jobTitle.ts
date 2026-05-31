import type { User } from './user'

export interface JobTitle {
  id: string
  code: string
  displayName: string
  notes: string | null
  users: User[]
  createdAt: Date
  updatedAt: Date
  _count: {
    users?: number
  }
}
