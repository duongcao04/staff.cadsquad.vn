import { IPostResponse } from '../interfaces'

export type TPost = Omit<Required<IPostResponse>, 'authorId' | 'topicId'>

export type TPostEvent = {
    id: string
    title: string
    location?: string
    startDate: Date | string
    redirectUrl: string
    thumbnailUrl: string
    post: TPost
}
