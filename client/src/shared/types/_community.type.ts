import { ECommunityRole } from '../enums/_community-role.enum'
import { ICommunityResponse } from '../interfaces/_community.interface'
import { TUser } from './_user.type'

export type TCommunity = Required<ICommunityResponse>

export type TCommunityMember = {
    id: string
    userId: string
    communityId: string
    role: ECommunityRole
    joinedAt: Date
    user?: TUser // Optional relation
}
