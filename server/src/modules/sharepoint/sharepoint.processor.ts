import { azureConfig } from '@/config'
import { ConfidentialClientApplication } from '@azure/msal-node'
import { Client } from '@microsoft/microsoft-graph-client'
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { Job, Queue } from 'bullmq'
import * as fs from 'fs'
import 'isomorphic-fetch'
import {
	JOB_CREATE_FOLDER,
	JOB_UPLOAD_FILE,
	SHAREPOINT_QUEUE,
} from './sharepoint.constants'

@Processor(SHAREPOINT_QUEUE)
export class SharePointProcessor extends WorkerHost {
	private readonly logger = new Logger(SharePointProcessor.name)

	private msalClient: ConfidentialClientApplication

	constructor(
		@Inject(azureConfig.KEY)
		private readonly config: ConfigType<typeof azureConfig>,
		@InjectQueue(SHAREPOINT_QUEUE) private readonly spQueue: Queue
	) {
		super()
		this.msalClient = new ConfidentialClientApplication({
			auth: {
				clientId: this.config.azure.clientId,
				clientSecret: this.config.azure.clientSecret,
				authority: `https://login.microsoftonline.com/${this.config.azure.tenantId}`,
			},
		})
	}

	async process(job: Job<any>): Promise<any> {
		switch (job.name) {
			case JOB_UPLOAD_FILE:
				return await this.handleFileUpload(job.data)
			case JOB_CREATE_FOLDER:
				return await this.handleCreateFolder(job.data)
		}
	}

	private async handleFileUpload(data: {
		parentId: string
		filePath: string
		originalName: string
	}) {
		const client = await this.getGraphClient()
		const fileBuffer = fs.readFileSync(data.filePath)

		// Logic tìm Drive ID (nên cache lại siteId/driveId ở bước init)
		const endpoint = `/drives/YOUR_DRIVE_ID/items/${data.parentId}:/${data.originalName}:/content`

		try {
			this.logger.log(
				`🚀 Uploading ${data.originalName} to SharePoint...`
			)
			const response = await client.api(endpoint).put(fileBuffer)

			// Xóa file tạm sau khi upload thành công
			fs.unlinkSync(data.filePath)

			return response
		} catch (error) {
			this.logger.error(`❌ SharePoint Upload Failed: ${error.message}`)
			throw error // Để BullMQ retry
		}
	}

	async handleCreateFolder({
		parentId,
		folderName,
		driveId,
		childrenToSpawn, // <--- 1. Nhận thêm tham số này
	}: {
		parentId: string
		folderName: string
		driveId: string
		childrenToSpawn?: string[] // Optional
	}) {
		const client = await this.getGraphClient()
		const driveBaseUrl = `/drives/${driveId}`

		const endpoint =
			parentId === 'root'
				? `${driveBaseUrl}/root/children`
				: `${driveBaseUrl}/items/${parentId}/children`

		const driveItem = {
			name: folderName,
			folder: {},
			'@microsoft.graph.conflictBehavior': 'rename',
		}

		try {
			// 2. Tạo Folder Cha (Dùng await để lấy kết quả ngay)
			const newFolder = await client.api(endpoint).post(driveItem)

			this.logger.log(
				`✅ Created folder: ${folderName} (ID: ${newFolder.id})`
			)

			// 3. 🔥 LOGIC SPAWN: Nếu có danh sách con, tạo Job cho chúng
			if (
				childrenToSpawn &&
				Array.isArray(childrenToSpawn) &&
				childrenToSpawn.length > 0
			) {
				this.logger.log(
					`✨ Spawning ${childrenToSpawn.length} child folders inside '${folderName}'...`
				)

				// Map danh sách tên folder thành danh sách Job
				const childJobs = childrenToSpawn.map((childName) => ({
					name: JOB_CREATE_FOLDER, // Tên Job (Import từ constants)
					data: {
						folderName: childName,
						parentId: newFolder.id, // <--- QUAN TRỌNG: Lấy ID của cha vừa tạo
						driveId: driveId,
						childrenToSpawn: [], // Con thì không đẻ thêm nữa (tránh đệ quy vô tận nếu không kiểm soát)
					},
					opts: {
						attempts: 3, // Retry nếu lỗi
						removeOnComplete: true,
					},
				}))

				// Đẩy 1 cục vào Queue (Bulk Add cho nhanh)
				await this.spQueue.addBulk(childJobs)
			}

			return newFolder // Return object để log hoặc debug nếu cần
		} catch (error) {
			this.logger.error(`Create folder failed: ${error.message}`)
			throw error // Ném lỗi để BullMQ biết và retry
		}
	}

	// Helper lấy Graph Client (Tương tự code cũ của bạn)
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
}
