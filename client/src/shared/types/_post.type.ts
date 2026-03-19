import { TTopic } from './_topic.type'
import { TUser } from './_user.type'

export type TPost = {
    id: string

    content: string

    // Attachments (Optional: reused from your existing attachment logic)
    attachments?: string[]

    // Relation to Author
    authorId: string

    author: TUser

    // Relation to Topic
    topicId: string
    topic: TTopic

    likeCount: number
    event?: TPostEvent

    // Engagement metadata
    isPinned: boolean

    createdAt: Date | string
    updatedAt: Date | string
}

export type TPostEvent = {
    id: string
    title: string
    location?: string
    startDate: Date | string
    redirectUrl: string
    thumbnailUrl: string
    post: TPost
}
