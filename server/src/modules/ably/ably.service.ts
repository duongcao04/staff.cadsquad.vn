import { ablyConfig } from '@/config'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import * as Ably from 'ably'

@Injectable()
export class AblyService {
	private readonly logger = new Logger(AblyService.name)
	private client: Ably.Rest

	constructor(
		@Inject(ablyConfig.KEY)
		private readonly config: ConfigType<typeof ablyConfig>
	) {
		// Khởi tạo Client ngay khi Service được tạo
		// Dùng key từ config đã validate
		this.client = new Ably.Rest({ key: this.config.key })
	}

	async createTokenRequest(userId: string) {
		try {
			const tokenRequestData = await this.client.auth.createTokenRequest({
				clientId: userId,
				// Có thể thêm ttl (thời gian sống của token) nếu cần
				// ttl: 3600 * 1000,
			})

			this.logger.log(`Created token request for user: ${userId}`)
			return tokenRequestData
		} catch (error) {
			this.logger.error(`Failed to create token request: ${error}`)
			throw error
		}
	}

	/**
	 * Gửi tin nhắn (Publish) lên một kênh (Channel)
	 */
	async publish(channelName: string, eventName: string, data: any) {
		const channel = this.client.channels.get(channelName)

		try {
			// Publish là bất đồng bộ
			await channel.publish(eventName, data)
			this.logger.log(`[Ably] Published to ${channelName}: ${eventName}`)
		} catch (error) {
			this.logger.error(
				`[Ably] Publish failed to ${channelName}: ${error}`
			)
			throw error
		}
	}
}
