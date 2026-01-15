import * as Ably from 'ably';

import { ablyApi } from './api';
import { axiosClient } from './axios';

// Client sẽ gọi API lên Server để xin token tạm thời.
export const ablyClient = new Ably.Realtime({
	authCallback: async (_, callback) => {
		try {
			const res = await axiosClient.get(ablyApi.authUrl);
			// XỬ LÝ:
			// Trường hợp 1: Server trả về nguyên gốc -> dùng result
			// Trường hợp 2: Server bọc trong { data: ... } -> dùng result.data
			const tokenRequest = res.data.result ? res.data.result : res.data;

			callback(null, tokenRequest);
		} catch (err) {
			callback(err as string, null);
		}
	},
	autoConnect: true
});

export const CHANNELS = {
	userNotificationsKey: (username: string) => {
		return "user-notifications" + ":" + username
	}
}