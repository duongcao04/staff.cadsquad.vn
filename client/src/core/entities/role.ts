import type { Permission } from './permission'
import type { User } from './user'

export interface Role {
  id: string
  displayName: string
  code: string
  hexColor: string
  permissions: Permission[]
  users: User[]
  createdAt: string | Date
  updatedAt: string | Date
}
