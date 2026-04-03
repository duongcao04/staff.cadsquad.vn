import { mutationOptions, queryOptions } from "@tanstack/react-query"
import { sharepointApi } from "../../api/_sharepoint.api"
import { onErrorToast } from "../helper"
import { SharePointHelper } from "../../helpers"

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
		select: (res) => {
			return SharePointHelper.flattenFolderData(res.result)
		},
	})
}

export const uploadSharepointFileOptions = mutationOptions({
	mutationFn: async ({
		parentId,
		file,
	}: {
		parentId: string
		file: File
	}) => {
		return sharepointApi.uploadFile(parentId, file)
	},
	onError: (err) => onErrorToast(err, 'Upload File Failed'),
})

export const copySharepointItemOptions = mutationOptions({
	mutationFn: async ({
		itemId,
		destinationFolderId,
		newName,
	}: {
		itemId: string
		destinationFolderId: string
		newName?: string
	}) => {
		return sharepointApi.copyItem(itemId, destinationFolderId, newName)
	},
	onError: (err) => onErrorToast(err, 'Copy item failed'),
})