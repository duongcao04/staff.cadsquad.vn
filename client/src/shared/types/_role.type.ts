import { TUser } from '../types'
import { TPermission } from './_permission.type'

export type TRole = {
    id: string
    displayName: string
    code: string
    hexColor: string
    permissions: TPermission[]
    users: TUser[]

    createdAt: string | Date
    updatedAt: string | Date
}
