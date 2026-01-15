import { TPostEvent, TTopic, TUser } from '../types'

export interface IPostResponse {
    id?: string
    content?: string

    // Attachments (Optional: reused from your existing attachment logic)
    attachments?: string[]

    // Relation to Author
    authorId?: string
    author: TUser

    // Relation to Topic
    topicId?: string
    topic?: TTopic

    likeCount?: number
    event?: TPostEvent | null

    // Engagement metadata
    isPinned?: boolean

    createdAt?: Date | string
    updatedAt?: Date | string
}
