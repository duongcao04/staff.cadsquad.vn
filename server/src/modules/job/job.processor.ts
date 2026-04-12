import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { randomUUID } from 'crypto'
import { SharePointService } from '../sharepoint/sharepoint.service'
import { CreateJobDto } from './dto/create-job.dto'
import { JOB_CREATED_HANDLER, JOB_QUEUE } from './job.constants'
import { PrismaService } from '../../providers/prisma/prisma.service'
import crypto from 'node:crypto'

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
				return await this.handleCopySharepointFolder(job.data)
			default:
				this.logger.warn(`No handler for job name: ${job.name}`)
		}
	}

	private async handleCopySharepointFolder(
		data: CreateJobDto & { destinationFolderCreationId: string }
	): Promise<any> {
		const { destinationFolderCreationId, ...dto } = data

		try {
			if (!dto.sharepointTemplateId) {
				throw new Error('Please provide exist Folder Template ID')
			}

			const sharepointFolderName = `${dto.no}- ${dto.clientName.toUpperCase()}_${dto.displayName.toUpperCase()}`

			// 1. TẠO RECORD TRẠNG THÁI "SYNCING"
			await this.prisma.job.update({
				where: { no: dto.no },
				data: {
					folderTemplate: {
						connect: { id: dto.sharepointTemplateId },
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
			this.logger.log(`Job ${dto.no} is now SYNCING sharepoint folder...`)

			// 2. CHẠY COPY NGẦM TRÊN MICROSOFT
			const folderDetail =
				await this.sharepointService.excuteCopySharepointFolder({
					itemId: dto.sharepointTemplateId,
					destinationFolderId: destinationFolderCreationId,
					newName: sharepointFolderName,
				})

			console.log(folderDetail)

			// 3. COPY XONG -> UPDATE THÀNH "SUCCESS"
			await this.prisma.job.update({
				where: { no: dto.no },
				data: {
					sharepointFolder: {
						// LƯU Ý: Đổi từ create -> update vì bước 1 đã create rồi
						update: {
							syncStatus: 'SUCCESS',
							itemId: crypto.randomUUID(),
							webUrl: folderDetail?.['webUrl'] || '',
							displayName: folderDetail?.['name'] || '',
							createdBy:
								folderDetail?.['createdBy']?.['name'] ||
								folderDetail?.['createdBy']?.['user']?.[
									'displayName'
								] ||
								'Unknown',
							createdDateTime: folderDetail?.['createdDateTime'],
							size: folderDetail?.['size'] || 0,
						},
					},
				},
			})
			this.logger.log(
				`Created job with Copy Template folder. Sharepoint Folder ID: ${folderDetail?.['id']}`
			)
		} catch (error) {
			this.logger.error(
				`handleCopySharepointFolder failed: ${(error as Error).message}`
			)

			// XỬ LÝ LỖI: Update trạng thái thành FAILED
			if (dto.no) {
				try {
					await this.prisma.job.update({
						where: { no: dto.no },
						data: {
							sharepointFolder: {
								update: { syncStatus: 'FAILED' },
							},
						},
					})
					this.logger.log(
						`Updated sharepoint folder syncStatus to FAILED for job ${dto.no}`
					)
				} catch (dbError) {
					this.logger.error(
						`Could not update FAILED status for job ${dto.no}`
					)
				}
			}
			throw error
		}
	}
}
