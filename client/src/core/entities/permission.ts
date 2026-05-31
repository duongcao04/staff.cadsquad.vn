import type { Role } from './role'

export interface Permission {
  id: string
  displayName: string
  code: string
  entity: string
  action: string
  entityAction: string
  description?: string
  roles: Role[]
  createdAt: string | Date
  updatedAt: string | Date
}

export type GroupPermission = {
  id: string
  name: string
  code: string
  permissions: Permission[]
}
