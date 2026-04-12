import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { randomUUID } from 'crypto'
import { ResponseType } from '@microsoft/microsoft-graph-client'
import { SharePointService } from '../sharepoint/sharepoint.service'
import { CreateJobDto } from './dto/create-job.dto'
import { JOB_CREATED_HANDLER, JOB_QUEUE } from './job.constants'
import { PrismaService } from '../../providers/prisma/prisma.service'
import cryto from 'node:crypto'

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

	private async jobCreatedHandler(
		data: CreateJobDto & { destinationFolderCreationId: string }
	): Promise<any> {
		const { destinationFolderCreationId, ...dto } = data
		try {
			const useExistingSharepointFolder =
				dto.useExistingSharepointFolder === '1'

			if (useExistingSharepointFolder) {
				if (!dto.sharepointFolderId) {
					throw new Error('Please provide exist Sharepoint folder ID')
				}
				const folderDetail =
					await this.sharepointService.getFolderDetails(
						dto.sharepointFolderId
					)

				await this.prisma.job.update({
					where: { no: dto.no },
					data: {
						sharepointFolder: {
							create: {
								syncStatus: 'SUCCESS', // Dùng thư mục có sẵn -> SUCCESS luôn
								id: randomUUID(),
								itemId: dto.sharepointFolderId,
								webUrl: folderDetail.webUrl,
								displayName: folderDetail.name,
								isFolder: true,
								createdBy:
									folderDetail.createdBy?.name ||
									folderDetail.createdBy?.displayName ||
									folderDetail.createdBy?.user?.displayName ||
									'Unknown',
								createdDateTime: folderDetail.createdDateTime,
								size: folderDetail.size || 0,
							},
						},
					},
				})

				this.logger.log(
					`Created job with exist Sharepoint folder. Sharepoint Folder ID: ${dto.sharepointFolderId}`
				)
			} else {
				if (!dto.sharepointTemplateId) {
					throw new Error('Please provide exist Folder Template ID')
				}

				const sharepointFolderName = `${dto.no}- ${dto.clientName.toUpperCase()}_${dto.displayName.toUpperCase()}`

				// 1. TẠO RECORD TRẠNG THÁI "SYNCING" (Để UI hiển thị đang loading)
				await this.prisma.job.update({
					where: { no: dto.no },
					data: {
						sharepointFolder: {
							create: {
								id: randomUUID(),
								syncStatus: 'SYNCING',
								itemId: 'PENDING_COPY', // Chuỗi tạm thời chờ copy xong
								webUrl: '',
								displayName: sharepointFolderName,
								isFolder: true,
								createdBy: 'System', // User mặc định khi hệ thống đang chạy
								size: 0,
							},
						},
					},
				})
				this.logger.log(
					`Job ${dto.no} is now SYNCING sharepoint folder...`
				)

				// 2. CHẠY COPY NGẦM TRÊN MICROSOFT
				const folderDetail =
					await this.sharepointService.excuteCopySharepointFolder({
						itemId: dto.sharepointTemplateId,
						destinationFolderId: destinationFolderCreationId,
						newName: sharepointFolderName,
					})

				// 3. COPY XONG -> UPDATE THÀNH "SUCCESS" VÀ ĐIỀN DATA THẬT
				await this.prisma.job.update({
					where: { no: dto.no },
					data: {
						folderTemplate: {
							connect: {
								id: dto.sharepointTemplateId,
							},
						},
						sharepointFolder: {
							create: {
								// LƯU Ý: Phải đổi từ 'create' sang 'update' vì record đã tồn tại
								syncStatus: 'SUCCESS',
								itemId: cryto.randomUUID(), // Đã có ID thật
								webUrl: folderDetail?.['webUrl'] || '',
								displayName: folderDetail?.['name'] || '',
								createdBy:
									folderDetail?.['createdBy']?.['name'] ||
									folderDetail?.['createdBy']?.['user']?.[
										'displayName'
									] ||
									'Unknown',
								createdDateTime:
									folderDetail?.['createdDateTime'],
								size: folderDetail?.['size'] || 0,
							},
						},
					},
				})
				this.logger.log(
					`Created job with Copy Template folder. Sharepoint Folder ID: ${folderDetail?.['id']}`
				)
			}
		} catch (error) {
			this.logger.error(
				`jobCreatedHandler failed: ${(error as Error).message}`
			)

			// XỬ LÝ LỖI: Update trạng thái thành FAILED để UI biết copy thất bại
			if (dto.no && dto.useExistingSharepointFolder !== '1') {
				try {
					await this.prisma.job.update({
						where: { no: dto.no },
						data: {
							sharepointFolder: {
								update: {
									syncStatus: 'FAILED',
								},
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
