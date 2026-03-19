import { ETopicType } from '../enums'
import { TCommunity } from './_community.type'

export type TTopic = {
    id: string
    code: string
    title: string
    description?: string
    type: ETopicType
    icon?: string
    communityId?: string
    community?: TCommunity
    createdAt: Date | string
    updatedAt: Date | string
}
