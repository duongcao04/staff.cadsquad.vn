import { Processor, WorkerHost } from '@nestjs/bullmq'
import { BadRequestException, Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { randomUUID } from 'crypto'
import { SharePointService } from '../sharepoint/sharepoint.service'
import { CreateJobDto } from './dto/create-job.dto'
import { JOB_CREATED_HANDLER, JOB_QUEUE } from './job.constants'
import { PrismaService } from '../../providers/prisma/prisma.service'
import crypto from 'node:crypto'
import { JobCreatedHandlerDto } from './dto/queue/job-created-handler.dto'

@Processor(JOB_QUEUE)
export class JobProcessor extends WorkerHost {
	private readonly logger = new Logger(JobProcessor.name)

	constructor(
		private readonly sharepointService: SharePointService,
		private readonly prisma: PrismaService
	) {
		super()
	}

	async process(job: Job): Promise<any> {
		switch (job.name) {
			case JOB_CREATED_HANDLER:
				return await this.jobCreatedHandler(job.data)
			default:
				this.logger.warn(`No handler for job name: ${job.name}`)
		}
	}

	private async jobCreatedHandler(data: JobCreatedHandlerDto): Promise<any> {
		const {
			destinationFolderCreationId,
			jobNo,
			folderTemplateId,
			sharepointFolderName,
			sharepointFolderTemplateId,
		} = data

		try {
			this.logger.log(`Job ${jobNo} is now SYNCING sharepoint folder...`)
			// 1. TẠO RECORD TRẠNG THÁI "SYNCING"
			await this.prisma.job.update({
				where: { no: jobNo },
				data: {
					folderTemplate: {
						connect: { id: folderTemplateId },
					},
					sharepointFolder: {
						create: {
							id: randomUUID(),
							syncStatus: 'SYNCING',
							itemId: 'PENDING_COPY',
							webUrl: '',
							displayName: sharepointFolderName,
							isFolder: true,
							createdBy: 'System',
							size: 0,
						},
					},
				},
			})
			if (!sharepointFolderTemplateId) {
				throw new BadRequestException(
					'Copy failed. Please provider Sharepoint Folder Template Id'
				)
			}
			const copiedFolder = await this.excuteCopyFolder({
				destinationId: destinationFolderCreationId,
				itemId: sharepointFolderTemplateId,
				newName: sharepointFolderName,
			})

			// 3. COPY XONG -> UPDATE THÀNH "SUCCESS"
			await this.prisma.job.update({
				where: { no: jobNo },
				data: {
					sharepointFolder: {
						// LƯU Ý: Đổi từ create -> update vì bước 1 đã create rồi
						update: {
							syncStatus: 'SUCCESS',
							itemId: copiedFolder.id,
							webUrl: copiedFolder.webUrl || '',
							displayName: copiedFolder.name || '',
							createdBy:
								copiedFolder?.['createdBy']?.['name'] ||
								copiedFolder?.['createdBy']?.['user']?.[
									'displayName'
								] ||
								'System',
							createdDateTime:
								copiedFolder?.['createdDateTime'] ||
								new Date().toISOString(),
							size: copiedFolder.size || 0,
						},
					},
				},
			})
		} catch (error) {
			this.logger.log(
				`Job created event have error: ${JSON.stringify(data)}`
			)
			// XỬ LÝ LỖI: Update trạng thái thành FAILED
			if (jobNo) {
				try {
					await this.prisma.job.update({
						where: { no: jobNo },
						data: {
							sharepointFolder: {
								update: { syncStatus: 'FAILED' },
							},
						},
					})
					this.logger.log(
						`Updated sharepoint folder syncStatus to FAILED for job ${jobNo}`
					)
				} catch (dbError) {
					this.logger.error(
						`Could not update FAILED status for job ${jobNo}`
					)
				}
			}
			throw error
		}
	}

	private async excuteCopyFolder(data: {
		itemId: string
		destinationId: string
		newName: string
	}) {
		const { destinationId, itemId, newName } = data

		const copyFolderPayload = {
			itemId: itemId,
			destinationFolderId: destinationId,
			newName: newName,
		}

		try {
			// 2. CHẠY COPY NGẦM TRÊN MICROSOFT
			const folderDetail =
				await this.sharepointService.excuteCopySharepointFolder(
					copyFolderPayload
				)

			return folderDetail
		} catch (error) {
			this.logger.error(
				`Excute copy folder template failed: ${JSON.stringify({
					error: (error as Error).message,
					payload: copyFolderPayload,
				})}`
			)
			return false
		}
	}
}
