import { EntityEnum } from '../enums/_entity.enum'
import { TUser } from '../types'

export type TPermission = {
    id: string
    displayName: string
    code: string
    entity: EntityEnum
    action: string
    entityAction: string
    description?: string
    roles: TRole[]
}

export type TRole = {
    id: string
    displayName: string
    code: string
    hexColor: string
    // Relation: Role has many Permissions
    permissions: TPermission[]
    users: TUser[]
}

export type TGroupPermission = {
    id: string
    name: string
    code: string
    permissions: TPermission[]
}
