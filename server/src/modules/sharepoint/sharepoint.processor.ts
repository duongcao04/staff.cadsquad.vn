import { azureConfig } from '@/config'
import { ConfidentialClientApplication } from '@azure/msal-node'
import { Client } from '@microsoft/microsoft-graph-client'
import { HttpService } from '@nestjs/axios'
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { Job, Queue } from 'bullmq'
import * as fs from 'fs'
import 'isomorphic-fetch'
import { firstValueFrom } from 'rxjs'
import { UploadFileDto } from './dtos/upload-file.dto'
import {
	JOB_COPY_ITEM,
	JOB_CREATE_FOLDER,
	JOB_UPLOAD_FILE,
	SHAREPOINT_QUEUE,
} from './sharepoint.constants'
import { CreateFolerDto } from './dtos/create-folder.dto'
import { CopyItemDto } from './dtos/copy-item.dto'

interface SharepointJobData {
	// For file upload
	parentId?: string
	filePath?: string
	originalName?: string
	// For folder creation
	folderName?: string
	driveId?: string
	childrenToSpawn?: string[]
	// For copy item
	sourceItemId?: string
	destinationFolderId?: string
	newName?: string
}

@Processor(SHAREPOINT_QUEUE)
export class SharePointProcessor extends WorkerHost {
	private readonly logger = new Logger(SharePointProcessor.name)

	private msalClient: ConfidentialClientApplication

	constructor(
		@Inject(azureConfig.KEY)
		private readonly config: ConfigType<typeof azureConfig>,
		@InjectQueue(SHAREPOINT_QUEUE) private readonly spQueue: Queue,
		private readonly httpService: HttpService
	) {
		super()
		this.msalClient = new ConfidentialClientApplication({
			auth: {
				clientId: this.config.azure.clientId,
				clientSecret: this.config.azure.clientSecret,
				authority: `https://login.microsoftonline.com/${this.config.azure.tenantId}`,
			},
		})

		// Ensure Redis connection options are configured properly
		this.spQueue.opts = {
			...this.spQueue.opts,
			defaultJobOptions: {
				...this.spQueue.opts?.defaultJobOptions,
				attempts: 5, // Set maximum retry attempts
			},
		};
	}

	async process(job: Job): Promise<any> {
		switch (job.name) {
			case JOB_UPLOAD_FILE:
				return await this.handleFileUpload(job.data)
			case JOB_CREATE_FOLDER:
				return await this.handleCreateFolder(job.data)
			case JOB_COPY_ITEM:
				return await this.handleCopyItem(job.data)
		}
	}
	private async handleFileUpload(data: UploadFileDto) {
		const { parentId, filePath, originalName, driveId } = data;
		const client = await this.getGraphClient();
		const fileBuffer = fs.readFileSync(filePath);
		const totalSize = fileBuffer.length;

		// Use your logic to get driveId or use the one from config
		const itemPath = parentId === 'root' ? `/root:/${originalName}` : `/items/${parentId}:/${originalName}`;
		const sessionUrl = `/drives/${driveId}${itemPath}:/createUploadSession`;

		let result: any;

		try {
			if (totalSize <= 4 * 1024 * 1024) {
				// For small files, the Graph SDK returns the DriveItem directly
				const endpoint = `/drives/${driveId}${itemPath}:/content`;
				result = await client.api(endpoint).put(fileBuffer);
			} else {
				// For large files, get the upload session url
				const session = await client.api(sessionUrl).post({
					item: { '@microsoft.graph.conflictBehavior': 'rename' }
				});
				// Await and capture the returned data from our chunk uploader
				result = await this.uploadInChunks(session.uploadUrl, fileBuffer);
			}

			// Clean up temp file
			fs.unlinkSync(filePath);

			this.logger.log(`✅ Uploaded: ${originalName} (url: ${result?.webUrl})`);

			// Return the actual file metadata to BullMQ (job.returnvalue)
			return result?.webUrl;

		} catch (error) {
			this.logger.error(`❌ Upload Failed: ${(error as { message: string }).message}`);
			// Always clean up temp file even if upload fails
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
			throw error;
		}
	}

	private async uploadInChunks(uploadUrl: string, buffer: Buffer) {
		const totalSize = buffer.length;
		const chunkSize = 320 * 1024 * 10; // 3.2MB (must be multiple of 320KB)
		let cursor = 0;
		let lastResponse: any; // Used to capture the final API response

		while (cursor < totalSize) {
			const end = Math.min(cursor + chunkSize, totalSize);
			const chunk = buffer.slice(cursor, end);

			// Execute the PUT request and save the response
			lastResponse = await firstValueFrom(
				this.httpService.put(uploadUrl, chunk, {
					headers: {
						'Content-Length': chunk.length.toString(),
						'Content-Range': `bytes ${cursor}-${end - 1}/${totalSize}`,
					},
				}),
			);
			cursor = end;
		}

		// Microsoft Graph returns the uploaded 'DriveItem' JSON object 
		// in the body of the final successful chunk's response.
		return lastResponse?.data;
	}

	private async uploadLargeFile(uploadUrl: string, buffer: Buffer) {
		const chunkSize = 320 * 1024 // 320 KB per chunk
		let start = 0
		let end = chunkSize
		const totalSize = buffer.length

		while (start < totalSize) {
			const chunk = buffer.slice(start, end)
			await firstValueFrom(
				this.httpService.put(uploadUrl, chunk, {
					headers: {
						'Content-Range': `bytes ${start}-${end - 1}/${totalSize}`,
					},
				})
			)
			start = end
			end = Math.min(start + chunkSize, totalSize)
		}

		await firstValueFrom(
			this.httpService.put(uploadUrl, null, {
				headers: {
					'Content-Range': `bytes */${totalSize}`,
				},
			})
		)
	}

	async handleCreateFolder(data: CreateFolerDto): Promise<void> {
		const { parentId, folderName, driveId, childrenToSpawn } = data
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
			this.logger.error(`Create folder failed: ${(error as { message: string }).message}`)
			throw error // Ném lỗi để BullMQ biết và retry
		}
	}

	private async handleCopyItem(data: CopyItemDto): Promise<void> {
		const { itemId, destinationFolderId, driveId, newName } = data

		try {
			const client = await this.getGraphClient()

			// Build the copy request
			const copyRequest = {
				parentReference: {
					driveId: driveId,
					id: destinationFolderId,
				},
				name: newName || undefined, // Optional new name
			}

			// Execute the copy operation
			const copyResult = await client
				.api(`/drives/${driveId}/items/${itemId}/copy`)
				.post(copyRequest)

			this.logger.log(
				`✅ Copied item ${itemId} to ${destinationFolderId} (New ID: ${JSON.stringify(copyResult)})`
			)

			return copyResult
		} catch (error) {
			this.logger.error(`Copy item failed: ${(error as { message: string }).message}`)
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
