import { databaseConfig } from '@/config'
import { Logger, Provider } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import Redis from 'ioredis'

export const REDIS_CLIENT = 'REDIS_CLIENT'

export const RedisProvider: Provider = {
	provide: REDIS_CLIENT,
	// Inject Database Config
	inject: [databaseConfig.KEY],

	useFactory: (config: ConfigType<typeof databaseConfig>) => {
		const logger = new Logger('RedisProvider')
		const redisConfig = config.redis // Lấy phần config Redis

		const client = new Redis({
			host: redisConfig.host,
			port: redisConfig.port,
			password: redisConfig.password,
			db: 0, // Mặc định DB 0

			// Các cấu hình quan trọng để giúp kết nối không rớt khi dùng Tunnel/Docker
			maxRetriesPerRequest: null, // BullMQ yêu cầu thuộc tính này phải là null
			keepAlive: 10000, // Ping mỗi 10 giây để giữ kết nối sống
			
			// Tự động reconnect nếu mất kết nối
			retryStrategy: (times) => {
				// Thử lại tối đa 20 lần
				return Math.min(times * 50, 2000)
			},
		})

		// Logging chi tiết
		client.on('connect', () => {
			logger.log('Redis connected successfully')
		})

		client.on('error', (err) => {
			logger.error('Redis Connection Error', err)
		})

		return client
	},
}
