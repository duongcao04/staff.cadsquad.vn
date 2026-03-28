import { ApiResponse, axiosClient } from "../axios"

export const auditLogApi = {
	findAll: async () => {
		const { data } = await axiosClient
			.get<ApiResponse<any>>('/v1/audit-logs')
		return data
	},
}