import { azureConfig } from '@/config'
import { ConfidentialClientApplication } from '@azure/msal-node'
import { Client } from '@microsoft/microsoft-graph-client'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import 'isomorphic-fetch'

@Injectable()
export class SharePointService {
	private readonly logger = new Logger(SharePointService.name)
	private msalClient: ConfidentialClientApplication
	private siteId: string
	private driveId: string

	// Cấu hình ID của Drive (Mặc định lấy Drive chính của Root Site)
	// Nếu bạn muốn trỏ vào Site khác, bạn cần thay đổi logic lấy Drive ID này.
	private driveEndpoint = '/sites/root/drive'

	constructor(
		@Inject(azureConfig.KEY)
		private readonly config: ConfigType<typeof azureConfig>
	) {
		this.msalClient = new ConfidentialClientApplication({
			auth: {
				clientId: this.config.azure.clientId,
				clientSecret: this.config.azure.clientSecret,
				authority: `https://login.microsoftonline.com/${this.config.azure.tenantId}`,
			},
		})
	}

	/**
	 * INIT: Hàm này cần chạy 1 lần để tìm ID của Site "Data"
	 * Thay vì hardcode /sites/root
	 */
	async onModuleInit() {
		// Tự động tìm Site ID của trang "Data"
		// URL host: vncsd.sharepoint.com
		// Server relative path: /sites/Data
		const client = await this.getGraphClient()

		try {
			// Tìm site theo đường dẫn server (Thay 'Data' bằng tên site trong URL của bạn)
			const site = await client
				.api('/sites/vncsd.sharepoint.com:/sites/Data')
				.get()
			this.siteId = site.id
			this.logger.log(
				`Connected to SharePoint Site: Data (ID: ${this.siteId})`
			)
		} catch (error) {
			this.logger.error(`Cannot find site 'Data'. Fallback to Root.`)
			this.siteId = 'root' // Fallback nếu không tìm thấy
		}
		if (!this.driveId) {
			const client = await this.getGraphClient()
			const drives = await client
				.api(`/sites/${this.siteId}/drives`)
				.get()
			// Tìm drive mặc định
			const targetDrive = drives.value.find(
				(d: any) => d.name === 'Documents'
			)
			if (targetDrive) {
				this.driveId = targetDrive.id
				this.logger.log(
					`Using Drive: ${targetDrive.name} (${this.driveId})`
				)
			}
		}
	}

	private async getAccessToken(): Promise<string> {
		const result = await this.msalClient.acquireTokenByClientCredential({
			scopes: ['https://graph.microsoft.com/.default'],
		})
		return result?.accessToken ?? ''
	}

	private async getGraphClient() {
		const accessToken = await this.getAccessToken()
		return Client.init({
			authProvider: (done) => done(null, accessToken),
		})
	}

	// ==========================================
	// 1. LIST FILES (DUYỆT FILE)
	// ==========================================

	/**
	 * Lấy danh sách file/folder.
	 * @param folderId (Optional) Nếu không truyền thì lấy Root.
	 */
	async getItems(folderId?: string) {
		const client = await this.getGraphClient()

		// Nếu có folderId -> lấy con của folder đó. Nếu không -> lấy root.
		const endpoint = folderId
			? `/drives/${this.driveId}/items/${folderId}/children`
			: `/drives/${this.driveId}/root/children`

		try {
			const response = await client.api(endpoint).get()
			// Map lại dữ liệu cho gọn gàng dễ dùng ở Frontend
			return response.value.map((item: any) => ({
				id: item.id,
				name: item.name,
				isFolder: !!item.folder, // Kiểm tra xem có phải folder không
				size: item.size,
				webUrl: item.webUrl,
				createdDateTime: item.createdDateTime,
				lastModifiedDateTime: item.lastModifiedDateTime,
				createdBy: item.createdBy?.user?.displayName || 'System',
			}))
		} catch (error) {
			this.logger.error(`List items failed: ${error.message}`)
			throw new BadRequestException('Cannot list items from SharePoint')
		}
	}

	// ==========================================
	// 2. UPLOAD FILE
	// ==========================================

	/**
	 * Upload file vào một folder cụ thể
	 */
	async uploadFile(parentId: string, file: Express.Multer.File) {
		const client = await this.getGraphClient()

		// Endpoint: /drive/items/{parent-id}:/{filename}:/content
		// Nếu parentId là 'root' thì dùng /root
		const parentPath =
			parentId === 'root'
				? `/drives/${this.driveId}/root`
				: `/drives/${this.driveId}/items/${parentId}`

		const endpoint = `${this.driveEndpoint}${parentPath}:/${file.originalname}:/content`

		try {
			// Upload trực tiếp buffer
			// Lưu ý: Upload session (cho file > 4MB) cần logic phức tạp hơn.
			// Đây là logic simple upload (cho file < 4MB).
			const response = await client.api(endpoint).put(file.buffer)
			return response
		} catch (error) {
			this.logger.error(`Upload failed: ${error.message}`)
			throw new BadRequestException('Upload to SharePoint failed')
		}
	}

	// ==========================================
	// 3. CREATE FOLDER
	// ==========================================

	async createFolder(parentId: string, folderName: string) {
		const client = await this.getGraphClient()

		// Thay vì dùng this.driveEndpoint (thường trỏ vào default drive),
		// ta dùng endpoint trỏ thẳng vào Drive ID cụ thể mà ta đã tìm được.
		// Điều này đảm bảo parentId (Item ID) luôn hợp lệ trong ngữ cảnh Drive này.
		const driveBaseUrl = `/drives/${this.driveId}`

		const endpoint =
			parentId === 'root'
				? `${driveBaseUrl}/root/children`
				: `${driveBaseUrl}/items/${parentId}/children`

		const driveItem = {
			name: folderName,
			folder: {}, // Đánh dấu đây là folder
			'@microsoft.graph.conflictBehavior': 'rename', // Nếu trùng tên thì tự thêm số (1), (2)...
		}

		try {
			return await client.api(endpoint).post(driveItem)
		} catch (error) {
			this.logger.error(`Create folder failed: ${error.message}`)
			throw error
		}
	}

	// ==========================================
	// 4. DOWNLOAD / PREVIEW
	// ==========================================

	/**
	 * Lấy link download trực tiếp (Temporary Download URL)
	 */
	async getDownloadUrl(itemId: string) {
		const client = await this.getGraphClient()
		const item = await client
			.api(`${this.driveEndpoint}/items/${itemId}`)
			.get()

		if (!item['@microsoft.graph.downloadUrl']) {
			throw new BadRequestException(
				'This item is not downloadable (maybe it is a folder)'
			)
		}
		return { url: item['@microsoft.graph.downloadUrl'] }
	}

	// ==========================================
	// 5. DELETE
	// ==========================================

	async deleteItem(itemId: string) {
		const client = await this.getGraphClient()
		await client.api(`${this.driveEndpoint}/items/${itemId}`).delete()
		return { success: true }
	}

	/**
	 * CỰC KỲ QUAN TRỌNG: Hàm lấy ID từ đường dẫn
	 * Input: "CSD- TEAM/ST006. CH.DUONG"
	 * Output: "01ABCDEF..." (Đây là parentId bạn cần)
	 */
	async getFolderIdByPath(path: string): Promise<string> {
		const client = await this.getGraphClient()

		// Đường dẫn Graph API để lấy item theo path:
		// /sites/{site-id}/drive/root:/{path-to-folder}
		const safePath = path.startsWith('/') ? path.substring(1) : path
		const endpoint = `/drives/${this.driveId}/root:/${safePath}`

		try {
			const item = await client.api(endpoint).get()
			return item.id // <--- ĐÂY CHÍNH LÀ parentId
		} catch (error) {
			this.logger.error(`Folder not found: ${path}`)
			throw new BadRequestException('Folder path not found in SharePoint')
		}
	}

	async listDrives() {
		const client = await this.getGraphClient()
		// Lấy danh sách các ổ đĩa trong Site này
		const response = await client.api(`/sites/${this.siteId}/drives`).get()

		return response.value.map((drive: any) => ({
			id: drive.id, // <--- ĐÂY LÀ CÁI CẦN TÌM
			name: drive.name, // Tên (vd: Documents)
			webUrl: drive.webUrl,
			description: drive.description,
		}))
	}
}
