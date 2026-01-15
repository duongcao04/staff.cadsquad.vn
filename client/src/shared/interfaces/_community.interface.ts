import { TTopic } from '../types'

export interface ICommunityResponse {
    id?: string
    code?: string
    displayName?: string
    description?: string | null
    color?: string | null
    icon?: string
    banner?: string
    topics?: TTopic[]
    createdAt?: Date | string
    updatedAt?: Date | string
}
