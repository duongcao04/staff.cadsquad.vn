import { queryOptions } from '@tanstack/react-query'
import { communityApi } from '../../api'

export const communitiesListOptions = () => {
    return queryOptions({
        queryKey: ['communities'],
        queryFn: () => communityApi.getCommunities(),
        select: (res) => {
            return res?.result
        },
    })
}
export const communitiesPostsListOptions = (code: string) => {
    return queryOptions({
        queryKey: ['communities', code, 'posts'],
        queryFn: () => communityApi.getCommunityPosts(code),
        select: (res) => {
            return res?.result
        },
    })
}

export const communityOptions = (identify: string) => {
    return queryOptions({
        queryKey: ['communities', 'identify', identify],
        queryFn: () => communityApi.getCommunityByCode(identify),
        select: (res) => {
            return res?.result
        },
    })
}
export const topicQueries = (communityCode: string, topicCode: string) => {
    return queryOptions({
        queryKey: ['topic', `community=${communityCode}`, `topic=${topicCode}`],
        queryFn: () => communityApi.getTopicDetails(communityCode, topicCode),
        select: (res) => {
            return res?.result
        },
    })
}
