import { cloudinaryConfig } from '@/config'
import { Provider } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { v2 as CloudinaryAPI } from 'cloudinary'

export const CLOUDINARY = 'CLOUDINARY'

export const CloudinaryProvider: Provider = {
	provide: CLOUDINARY,
	inject: [cloudinaryConfig.KEY],
	useFactory: (config: ConfigType<typeof cloudinaryConfig>) => {
		CloudinaryAPI.config({
			cloud_name: config.cloudName,
			api_key: config.apiKey,
			api_secret: config.apiSecret,
		})
		return CloudinaryAPI
	},
}
