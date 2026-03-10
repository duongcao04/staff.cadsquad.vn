import { queryOptions } from "@tanstack/react-query"
import { sharepointApi } from "../../api/_sharepoint.api"

// 1. Danh sách Jobs
export const sharepointFolderItemsOptions = (
	folderId: string
) => {
	return queryOptions({
		queryKey: [
			'sharepoint',
			`folder-items`,
			`indentify`,
			folderId,
		],
		queryFn: () => {
			return sharepointApi.folderItems(folderId)
		},
		select: (res) => ({
			items: res.result
		}),
	})
}