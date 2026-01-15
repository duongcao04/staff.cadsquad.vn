import { ITopicResponse } from '../interfaces/_topic.interface'

export type TTopic = Omit<Required<ITopicResponse>, 'communityId' | 'icon'> & {
    icon: string
}
