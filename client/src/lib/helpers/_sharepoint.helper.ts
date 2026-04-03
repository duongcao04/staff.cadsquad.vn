export interface FlattenedSharePointFolder {
	id: string;
	name: string;
	webUrl: string;
	childCount: number;
	sizeInMB: number;
	sizeInBytes: number;
	ownerName: string;
	ownerEmail: string;
	lastModified: string;
	displayPath: string;
	siteId: string;
}

export class SharePointHelper {
	/**
	 * Converts a complex Microsoft Graph DriveItem response into a 
	 * flat object for UI components.
	 */
	static flattenFolderData(apiResponse: any): FlattenedSharePointFolder | null {
		if (!apiResponse) return null;

		// Extracting path from: /drive/root:/Folder/Subfolder
		const rawPath = apiResponse.parentReference?.path || "";
		const cleanPath = rawPath.includes('root:')
			? rawPath.split('root:')[1]
			: rawPath;

		return {
			id: apiResponse.id,
			name: apiResponse.name,
			webUrl: apiResponse.webUrl,
			childCount: apiResponse.folder?.childCount || 0,

			// Convert bytes to MB (1024 * 1024)
			sizeInBytes: apiResponse.size || 0,
			sizeInMB: apiResponse.size ? Number((apiResponse.size / 1048576).toFixed(2)) : 0,

			// User Data
			ownerName: apiResponse.createdBy?.user?.displayName || "Unknown System",
			ownerEmail: apiResponse.createdBy?.user?.email || "",

			// Dates
			lastModified: apiResponse.lastModifiedDateTime || apiResponse.createdDateTime,

			// Hierarchy
			displayPath: cleanPath,
			siteId: apiResponse.parentReference?.siteId || ""
		};
	}

	/**
	 * Formats a raw byte number into a human-readable string
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