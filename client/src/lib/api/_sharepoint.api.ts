import { axiosClient, axiosClientMultipart, ApiResponse } from "../axios"

export const sharepointApi = {
	// 1. Lấy danh sách file
	folderItems: async (folderId: string) => {
		return axiosClient
			.get<
				ApiResponse<any[]>
			>(`/v1/sharepoint/items?folderId=${folderId}`)
			.then((res) => res.data)
	},

	// 2. Upload file to SharePoint
	uploadFile: async (parentId: string, file: File, onProgress?: (percent: number) => void) => {
		const form = new FormData();

		// Backup an toàn: Nếu parentId bị null/undefined thì truyền 'root'
		form.append('parentId', parentId || 'root');
		form.append('file', file);

		try {
			const response = await axiosClientMultipart.post<ApiResponse<any>>(
				'/v1/sharepoint/upload',
				form,
				{
					// Bắt sự kiện % của Axios và ném ra ngoài qua callback
					onUploadProgress: (progressEvent) => {
						if (progressEvent.total && onProgress) {
							const percentCompleted = Math.round(
								(progressEvent.loaded * 100) / progressEvent.total
							);
							onProgress(percentCompleted);
						}
					},
				}
			);

			// Trả về thẳng data để Component tự xử lý logic bóc tách (res.result)
			return response.data;

		} catch (error) {
			console.error('Lỗi API khi upload file lên SharePoint:', error);
			throw error;
		}
	},

	// 3. Copy folder or item in SharePoint
	copyItem: async (itemId: string, destinationFolderId: string, newName?: string) => {
		return axiosClient
			.post<ApiResponse<any>>('/v1/sharepoint/copy', {
				itemId,
				destinationFolderId,
				newName,
			})
			.then((res) => res.data)
	},
}