import { ETopicType } from '../enums/_topic-type.enum'
import { TCommunity } from '../types'

export interface ITopicResponse {
    id?: string
    code?: string
    title?: string
    description?: string | null
    type?: ETopicType
    icon?: string | null
    communityId?: string
    community?: TCommunity
    createdAt?: Date | string
    updatedAt?: Date | string
}
