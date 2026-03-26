import { queryOptions } from "@tanstack/react-query"
import { sharepointApi } from "../../api/_sharepoint.api"

// 1. Key Factory (Quản lý Key tập trung)
export const sharepointQueryKeys = {
	resource: ['sharepoint'] as const,
	itemsByFolderId: (folderId: string) => [...sharepointQueryKeys.resource, 'folder-items', folderId] as const,
	folderDetail: (folderId: string) => [...sharepointQueryKeys.resource, 'folder', 'detail', folderId] as const,
	lists: () => [...sharepointQueryKeys.resource, 'list'] as const,
	detailById: (id: string) => [...sharepointQueryKeys.resource, 'detail', id] as const,
}


// 2. Fetch Query
export const sharepointFolderItemsOptions = (
	folderId: string
) => {
	return queryOptions({
		queryKey: sharepointQueryKeys.itemsByFolderId(folderId),
		queryFn: () => {
			return sharepointApi.folderItems(folderId)
		},
		select: (res) => ({
			items: res.result
		}),
	})
}
export const sharepointFolderDetailOptions = (
	folderId: string
) => {
	return queryOptions({
		queryKey: sharepointQueryKeys.folderDetail(folderId),
		queryFn: () => {
			return sharepointApi.folderDetail(folderId)
		},
		select: (res) => ({
			items: res.result
		}),
	})
}

