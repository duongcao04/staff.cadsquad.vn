import { ApiResponse, axiosClient } from '../axios';

export const systemSettingApi = {
	findAll: async () => {
		const { data } = await axiosClient.get<ApiResponse<any>>('/v1/system-settings');
		return data;
	},
	findOne: async (key: string) => {
		const { data } = await axiosClient.get<ApiResponse<any>>(`/v1/system-settings/${key}`);
		return data;
	},
	upsert: async (payload: { key: string; value: string }) => {
		const { data } = await axiosClient.post<ApiResponse<any>>('/v1/system-settings', payload);
		return data;
	},
};