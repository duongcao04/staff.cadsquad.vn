import { azureConfig } from '@/config'
import { ConfidentialClientApplication } from '@azure/msal-node'
import { Client, ResponseType } from '@microsoft/microsoft-graph-client'
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq'
import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { FlowProducer, Queue, QueueEvents } from 'bullmq'
import * as fs from 'fs'
import 'isomorphic-fetch'
import {
	JOB_COPY_ITEM,
	JOB_CREATE_FOLDER,
	JOB_UPLOAD_FILE,
	SHAREPOINT_FLOW,
	SHAREPOINT_QUEUE,
} from './sharepoint.constants'
import { UploadFileDto } from './dtos/upload-file.dto'
import { CreateFolerDto } from './dtos/create-folder.dto'
import { CopyItemDto } from './dtos/copy-item.dto'
import axios from 'axios'

@Injectable()
export class SharePointService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(SharePointService.name)

	private msalClient: ConfidentialClientApplication
	private siteId: string | undefined
	private driveId: string | undefined

	// Cấu hình ID của Drive (Mặc định lấy Drive chính của Root Site)
	private driveEndpoint = '/sites/root/drive'

	constructor(
		// Inject FlowProducer
		@InjectFlowProducer(SHAREPOINT_FLOW)
		private readonly flowProducer: FlowProducer,
		// Inject Configuration
		@Inject(azureConfig.KEY)
		private readonly config: ConfigType<typeof azureConfig>,
		@InjectQueue(SHAREPOINT_QUEUE) private readonly spQueue: Queue
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
	 * INIT: Tìm Site ID và thiết lập QueueEvents
	 */
	async onModuleInit() {
		// 1. Khởi tạo QueueEvents để lắng nghe kết quả từ Processor
		// Bắt buộc phải chia sẻ connection với Queue gốc
		const connection = await this.spQueue.client
		this.logger.log('📡 SharePoint QueueEvents initialized.')

		// 2. Tìm Site "Data"
		const client = await this.getGraphClient()
		try {
			const site = await client
				.api('/sites/vncsd.sharepoint.com:/sites/Data')
				.get()
			this.siteId = site.id
			this.logger.log(
				`Connected to SharePoint Site: Data (ID: ${this.siteId})`
			)
		} catch (error) {
			this.logger.error(`Cannot find site 'Data'. Fallback to Root.`)
			this.siteId = 'root'
		}

		// 3. Tìm Drive ID mặc định ("Documents")
		if (!this.driveId) {
			const drives = await client
				.api(`/sites/${this.siteId}/drives`)
				.get()
			const targetDrive = drives.value.find(
				(d: any) => d.name === 'Documents'
			)
			if (targetDrive) {
				this.driveId = targetDrive.id
				this.driveEndpoint = `/drives/${this.driveId}` // Update endpoint dynamically
				this.logger.log(
					`Using Drive: ${targetDrive.name} (${this.driveId})`
				)
			}
		}
	}

	/**
	 * Dọn dẹp listener khi module bị hủy (Quan trọng để tránh memory leak)
	 */
	async onModuleDestroy() {}

	private async getAccessToken(): Promise<string> {
		const result = await this.msalClient.acquireTokenByClientCredential({
			scopes: ['https://graph.microsoft.com/.default'],
		})
		return result?.accessToken ?? ''
	}

	public async getGraphClient() {
		const accessToken = await this.getAccessToken()
		return Client.init({
			authProvider: (done) => done(null, accessToken),
		})
	}

	// ==========================================
	// 1. LIST FILES (DUYỆT FILE)
	// ==========================================
	async getItems(folderId?: string) {
		const client = await this.getGraphClient()

		const endpoint = folderId
			? `/drives/${this.driveId}/items/${folderId}/children`
			: `/drives/${this.driveId}/root/children`

		try {
			const response = await client.api(endpoint).get()
			return response.value.map((item: any) => ({
				id: item.id,
				name: item.name,
				isFolder: !!item.folder,
				size: item.size,
				webUrl: item.webUrl,
				createdDateTime: item.createdDateTime,
				lastModifiedDateTime: item.lastModifiedDateTime,
				createdBy: item.createdBy?.user?.displayName || 'System',
			}))
		} catch (error) {
			this.logger.error(
				`List items failed: ${(error as { message: string }).message}`
			)
			throw new BadRequestException('Cannot list items from SharePoint')
		}
	}

	// ==========================================
	// 2. UPLOAD FILE
	// ==========================================
	/**
	 * Upload file (Fire & Forget)
	 */
	async queueUploadFile(parentId: string, file: Express.Multer.File) {
		const workingDir = './working'
		if (!fs.existsSync(workingDir)) fs.mkdirSync(workingDir)

		const tempFilePath = `${workingDir}/${Date.now()}-${file.originalname}`
		fs.writeFileSync(tempFilePath, file.buffer)

		const payload: UploadFileDto = {
			driveId: this.driveId,
			parentId,
			filePath: tempFilePath,
			originalName: file.originalname,
		}
		const job = await this.spQueue.add(JOB_UPLOAD_FILE, payload)

		return {
			message: 'File queued for upload',
			jobId: job.id,
		}
	}

	async executeUploadFile(parentId: string, file: Express.Multer.File) {
		try {
			// 1. Lấy Access Token dùng chung hàm có sẵn
			const accessToken = await this.getAccessToken()

			// 2. Encode tên file để tránh lỗi URL
			const fileName = encodeURIComponent(file.originalname)

			// 3. Sử dụng endpoint động (như bạn dùng ở các hàm khác)
			// graph.microsoft.com/v1.0 đã được ngầm định khi dùng axios hoặc client.
			const createSessionUrl = `https://graph.microsoft.com/v1.0/drives/${this.driveId}/items/${parentId}:/${fileName}:/createUploadSession`

			// 4. Tạo Upload Session trên SharePoint
			const sessionResponse = await axios.post(
				createSessionUrl,
				{
					item: {
						'@microsoft.graph.conflictBehavior': 'rename', // Hoặc "replace" nếu muốn ghi đè
					},
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
				}
			)

			const uploadUrl = sessionResponse.data.uploadUrl

			// 5. Khởi tạo thông số băm nhỏ file (Chunking)
			const fileSize = file.size
			// Microsoft bắt buộc chunk size là bội số của 320 KiB (327,680 bytes)
			// 327680 * 10 = ~3.2MB cho mỗi chunk. Đây là mức lý tưởng.
			const chunkSize = 327680 * 10
			let start = 0
			let uploadResult = null

			this.logger.log(
				`Bắt đầu upload file ${file.originalname} (Size: ${fileSize} bytes)`
			)

			// 6. Đẩy từng chunk lên SharePoint
			while (start < fileSize) {
				const end = Math.min(start + chunkSize, fileSize)
				const chunk = file.buffer.slice(start, end)

				const chunkResponse = await axios.put(uploadUrl, chunk, {
					headers: {
						'Content-Length': chunk.length,
						// Header Content-Range bắt buộc: bytes {start}-{end}/{total}
						'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`,
					},
				})

				uploadResult = chunkResponse.data
				start = end

				// Tuỳ chọn: Ghi log tiến trình
				const percent = Math.round((start / fileSize) * 100)
				this.logger.debug(`Uploading ${file.originalname}: ${percent}%`)
			}

			this.logger.log(`Upload thành công file: ${file.originalname}`)

			// 7. Trả về kết quả sau khi hoàn thành
			return uploadResult
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.error?.message || error.message
			this.logger.error(
				`Error uploading file ${file.originalname} to SharePoint: ${errorMessage}`
			)

			throw new BadRequestException(
				`Failed to upload file to SharePoint. Error: ${errorMessage}`
			)
		}
	}

	// ==========================================
	// 3. CREATE FOLDER
	// ==========================================
	async queueCreateFolder(parentId: string, folderName: string) {
		const payload: CreateFolerDto = {
			parentId,
			folderName,
			driveId: this.driveId,
		}
		await this.spQueue.add(JOB_CREATE_FOLDER, payload)
		this.logger.log(`Queued create folder: ${folderName}`)
	}

	async queuCreateFolderWithChildren(
		rootParentId: string,
		parentName: string,
		childrenNames: string[]
	) {
		const payload: CreateFolerDto = {
			parentId: rootParentId,
			folderName: parentName,
			driveId: this.driveId,
			childrenToSpawn: childrenNames,
		}
		await this.spQueue.add(JOB_CREATE_FOLDER, payload)

		this.logger.log(
			`Queued parent: ${parentName} with ${childrenNames.length} children`
		)
	}

	async queueCopyItem(
		itemId: string,
		destinationFolderId: string,
		newName?: string
	) {
		const payload: CopyItemDto = {
			itemId,
			destinationFolderId,
			newName,
			driveId: this.driveId,
		}
		await this.spQueue.add(JOB_COPY_ITEM, payload)
		this.logger.log(`Queued copy item: ${itemId} to ${destinationFolderId}`)
	}

	async excuteCopySharepointFolder(data: {
		itemId: string
		destinationFolderId: string
		newName: string
	}) {
		const { itemId, destinationFolderId, newName } = data

		try {
			const client = await this.getGraphClient()
			const driveId = this.getDriveId()

			const copyRequest = {
				parentReference: { driveId, id: destinationFolderId },
				name: newName || undefined,
			}

			// 1. Gọi API Copy dạng RAW
			const response = await client
				.api(`/drives/${driveId}/items/${itemId}/copy`)
				.responseType(ResponseType.RAW)
				.post(copyRequest)

			// 2. Lấy Monitor URL
			const monitorUrl = response.headers.get('Location')
			if (!monitorUrl)
				throw new Error('Graph API did not return Location header')

			// 3. Vòng lặp Polling chờ MS xử lý
			let isDone = false
			let newSharepointItem = null

			while (!isDone) {
				await new Promise((resolve) => setTimeout(resolve, 2000))

				const statusResponse = await client.api(monitorUrl).get()

				if (statusResponse.status === 'completed') {
					isDone = true
					newSharepointItem = await client
						.api(
							`/drives/${driveId}/items/${statusResponse.resourceId}`
						)
						.get()
				} else if (statusResponse.status === 'failed') {
					throw new Error(
						`MS Graph copy failed: ${JSON.stringify(statusResponse)}`
					)
				}
			}

			this.logger.log(
				`✅ Copied item ${itemId} to ${destinationFolderId} (New ID: ${(newSharepointItem as unknown as { id: string }).id})`
			)

			return newSharepointItem
		} catch (error) {
			this.logger.error(`Copy item failed: ${(error as Error).message}`)
			throw error
		}
	}

	// ==========================================
	// 4. GET & DELETE
	// ==========================================

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

	async deleteItem(itemId: string) {
		const client = await this.getGraphClient()
		await client.api(`${this.driveEndpoint}/items/${itemId}`).delete()
		return { success: true }
	}

	async getFolderDetailsByPath(path: string) {
		const client = await this.getGraphClient()

		// Clean the path: remove leading slash and encode for URLs (handles spaces/special chars)
		const safePath = path.startsWith('/') ? path.substring(1) : path
		const encodedPath = encodeURIComponent(safePath)

		const endpoint = `/drives/${this.driveId}/root:/${encodedPath}`

		try {
			const item = await client
				.api(endpoint)
				// Specify exactly which fields you want
				.select([
					'id',
					'name',
					'webUrl',
					'folder', // Contains childCount
					'size', // Total size of all items inside
					'parentReference', // Site and Drive info
					'createdDateTime',
					'lastModifiedDateTime',
					'file', // Will be present if it's a file, null if folder
				])
				.get()

			return {
				id: item.id,
				name: item.name,
				url: item.webUrl,
				isFolder: !!item.folder,
				childCount: item.folder?.childCount || 0,
				totalSize: item.size,
				parentPath: item.parentReference?.path,
				createdAt: item.createdDateTime,
				updatedAt: item.lastModifiedDateTime,
				raw: item, // Keep the original response if needed
			}
		} catch (error) {
			this.logger.error(
				`Path resolution failed: ${path} - ${(error as Error).message}`
			)
			throw new BadRequestException(
				`Path '${path}' not found in SharePoint.`
			)
		}
	}

	async listDrives() {
		const client = await this.getGraphClient()
		const response = await client.api(`/sites/${this.siteId}/drives`).get()

		return response.value.map((drive: any) => ({
			id: drive.id,
			name: drive.name,
			webUrl: drive.webUrl,
			description: drive.description,
		}))
	}

	async getFolderDetails(folderId: string) {
		try {
			const client = await this.getGraphClient()
			// Ví dụ sử dụng Microsoft Graph Client
			const details = await client
				.api(`/sites/${this.siteId}/drive/items/${folderId}`)
				.get()

			return details
		} catch (error) {
			// Xử lý lỗi (ví dụ: NotFoundException nếu folder không tồn tại)
			throw error
		}
	}

	/**
	 * Trả về Drive ID đang được sử dụng (Mặc định là Documents của site Data)
	 */
	public getDriveId(): string {
		if (!this.driveId) {
			this.logger.error('Attempted to get driveId before initialization')
			throw new BadRequestException(
				'SharePoint Drive is not initialized or not found.'
			)
		}
		return this.driveId
	}

	/**
	 * Trả về Site ID đang được sử dụng
	 */
	public getSiteId(): string {
		if (!this.siteId) {
			throw new BadRequestException('SharePoint Site is not initialized.')
		}
		return this.siteId
	}
}
