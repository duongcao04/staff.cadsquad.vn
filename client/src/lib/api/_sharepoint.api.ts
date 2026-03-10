import { axiosClient, ApiResponse } from "../axios"

export const sharepointApi = {
	// 1. Lấy danh sách file
	folderItems: async (folderId: string) => {
		return axiosClient
			.get<
				ApiResponse<any[]>
			>(`/v1/sharepoint/items?folderId=${folderId}`)
			.then((res) => res.data)
	}
}