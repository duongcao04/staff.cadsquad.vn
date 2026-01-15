import { cloudinaryConfig } from '@/config'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { v2 as CloudinaryAPI, UploadApiResponse } from 'cloudinary'
import * as streamifier from 'streamifier'
import { CLOUDINARY } from './cloudinary.provider'

@Injectable()
export class CloudinaryService {
	private readonly logger = new Logger(CloudinaryService.name)

	constructor(
		// Inject Cloudinary Instance từ Provider
		@Inject(CLOUDINARY)
		private readonly cloudinary: typeof CloudinaryAPI,

		// Inject Config để lấy Folder Root
		@Inject(cloudinaryConfig.KEY)
		private readonly config: ConfigType<typeof cloudinaryConfig>
	) {}

	/**
	 * Upload a file buffer to Cloudinary.
	 */
	async uploadFile(
		file: Express.Multer.File,
		subFolder = '.temp'
	): Promise<UploadApiResponse> {
		if (!file) throw new BadRequestException('No file uploaded')

		// Tạo đường dẫn folder: RootFolder/SubFolder
		const folderPath = `${this.config.folder}/${subFolder}`

		return new Promise((resolve, reject) => {
			const uploadStream = this.cloudinary.uploader.upload_stream(
				{
					folder: folderPath,
					resource_type: 'auto', // Tự động nhận diện ảnh/video
				},
				(error, result) => {
					if (error) {
						this.logger.error(
							`Cloudinary Upload Error: ${error.message}`
						)
						return reject(error)
					}
					resolve(result as UploadApiResponse)
				}
			)

			streamifier.createReadStream(file.buffer).pipe(uploadStream)
		})
	}

	/**
	 * Delete a file from Cloudinary using its publicId.
	 */
	async deleteFile(publicId: string): Promise<{ result: string }> {
		if (!publicId) throw new BadRequestException('publicId is required')

		try {
			return await this.cloudinary.uploader.destroy(publicId)
		} catch (error) {
			this.logger.error(`Cloudinary Delete Error: ${error}`)
			throw error
		}
	}

	/**
	 * Get Cloudinary URL with optional transformations.
	 */
	generateUrl(publicId: string, options?: object): string {
		return this.cloudinary.url(publicId, {
			secure: true,
			transformation: [
				{ quality: 'auto', fetch_format: 'auto' }, // Tự động tối ưu ảnh
				...(options ? [options] : []),
			],
		})
	}
}
