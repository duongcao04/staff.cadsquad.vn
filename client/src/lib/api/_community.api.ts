import { type ApiResponse, axiosClient } from '@/lib/axios'
import { TPost } from '../../shared/types/_post.type'
import { TCreateCommunityInput } from '../validationSchemas/_community.schema'
import { TCreateTopicInput } from '../validationSchemas/_topic.schema'

export const communityApi = {
	// --- Communities ---
	getCommunities: async () =>
		axiosClient.get<ApiResponse<any[]>>('/v1/communities').then(res => res.data),

	getCommunityByCode: async (code: string) =>
		axiosClient.get<ApiResponse<any>>(`/v1/communities/${code}`).then(res => res.data),

	createCommunity: async (data: TCreateCommunityInput) =>
		axiosClient.post<ApiResponse<any>>('/v1/communities', data).then(res => res.data),

	joinCommunity: async (communityId: string) =>
		axiosClient.post<ApiResponse<{ success: boolean }>>(`/v1/communities/${communityId}/join`).then(res => res.data),

	// --- Topics ---
	getTopics: async (communityCode: string) =>
		axiosClient.get<ApiResponse<any[]>>(`/v1/communities/${communityCode}/topics`).then(res => res.data),

	getTopicDetails: async (communityCode: string, topicCode: string) =>
		axiosClient.get<ApiResponse<any>>(`/v1/communities/${communityCode}/topics/${topicCode}`).then(res => res.data),

	createTopic: async (data: TCreateTopicInput) =>
		axiosClient.post<ApiResponse<any>>('/v1/topics', data).then(res => res.data),

	// --- Posts (Feed) ---
	getPosts: async (topicId: string, page = 1) =>
		axiosClient.get<ApiResponse<TPost[]>>(`/v1/topics/${topicId}/posts`, {
			params: { page }
		}).then(res => res.data),

	getCommunityPosts: async (communityCode: string, params?: { page?: number, limit?: number }) =>
		axiosClient.get<ApiResponse<TPost[]>>(`/v1/communities/${communityCode}/posts`, {
			params: {
				page: params?.page ?? 1,
				limit: params?.limit ?? 20
			}
		}).then(res => res.data),
}