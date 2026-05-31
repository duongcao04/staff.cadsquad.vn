import { ECommunityRole } from '../enums/_community-role.enum'
import { TTopic } from './_topic.type'
import { TUser } from './_user.type'

export type TCommunity = {
    id: string
    code: string
    displayName: string
    description?: string
    color?: string
    icon?: string
    banner?: string
    topics: TTopic[]
    createdAt: Date | string
    updatedAt: Date | string
}

export type TCommunityMember = {
    id: string
    userId: string
    communityId: string
    role: ECommunityRole
    joinedAt: Date
    user?: TUser // Optional relation
}
