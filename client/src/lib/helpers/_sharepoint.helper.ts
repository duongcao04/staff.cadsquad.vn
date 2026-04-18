export interface FlattenedSharePointFolder {
	id: string;
	name: string;
	webUrl: string;
	childCount: number;
	sizeInMB: number;
	sizeInBytes: number;
	ownerName: string;
	lastModified: string;
	createdAt: string;
	displayPath: string;
	systemPath: string;
	siteId: string;
	parentName: string;
}

export class SharePointHelper {
	/**
	 * Maps both Custom API Wrappers and Raw Graph DriveItems to a flat UI object.
	 */
	static flattenFolderData(apiResponse: any): FlattenedSharePointFolder | null {
		if (!apiResponse) return null;

		// --- Style 1: Custom API Wrapper { path: string, id: { id, name, raw: {} } } ---
		if (apiResponse.detail && typeof apiResponse.detail === 'object' && apiResponse.detail.id) {
			const folderInfo = apiResponse.detail;
			const rawData = folderInfo.raw || {};

			return {
				id: folderInfo.id,
				name: folderInfo.name,
				webUrl: folderInfo.url || rawData.webUrl,
				childCount: folderInfo.childCount ?? 0,
				sizeInBytes: folderInfo.totalSize ?? 0,
				sizeInMB: folderInfo.totalSize
					? Number((folderInfo.totalSize / 1048576).toFixed(2))
					: 0,
				lastModified: folderInfo.updatedAt || rawData.lastModifiedDateTime,
				createdAt: folderInfo.createdAt || rawData.createdDateTime,
				ownerName: rawData.lastModifiedBy?.user?.displayName || rawData.createdBy?.user?.displayName || "System",
				displayPath: apiResponse.path || this.cleanGraphPath(rawData.parentReference?.path),
				systemPath: folderInfo.parentPath || rawData.parentReference?.path || "",
				parentName: rawData.parentReference?.name || "",
				siteId: rawData.parentReference?.siteId || ""
			};
		}

		// --- Style 2: Raw Microsoft Graph DriveItem { id, name, webUrl, folder: {} } ---
		return {
			id: apiResponse.id,
			name: apiResponse.name,
			webUrl: apiResponse.webUrl,
			childCount: apiResponse.folder?.childCount ?? 0,
			sizeInBytes: apiResponse.size ?? 0,
			sizeInMB: apiResponse.size
				? Number((apiResponse.size / 1048576).toFixed(2))
				: 0,
			lastModified: apiResponse.lastModifiedDateTime,
			createdAt: apiResponse.createdDateTime,
			ownerName: apiResponse.lastModifiedBy?.user?.displayName || apiResponse.createdBy?.user?.displayName || "System",
			displayPath: this.cleanGraphPath(apiResponse.parentReference?.path),
			systemPath: apiResponse.parentReference?.path || "",
			parentName: apiResponse.parentReference?.name || "",
			siteId: apiResponse.parentReference?.siteId || ""
		};
	}

	/**
	 * Helper to convert /drive/root:/Path/To/Folder into \Path\To\Folder
	 */
	private static cleanGraphPath(rawPath: string): string {
		if (!rawPath) return "";
		const pathAfterRoot = rawPath.includes('root:')
			? rawPath.split('root:')[1]
			: rawPath;
		return pathAfterRoot.replace(/\//g, '\\');
	}

	/**
	 * Formats bytes into human-readable strings
	 */
	static formatBytes(bytes: number, decimals = 2) {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}
}