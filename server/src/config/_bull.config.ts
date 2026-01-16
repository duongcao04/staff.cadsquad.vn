import { registerAs } from '@nestjs/config'
import { z } from 'zod'

// 1. Định nghĩa Schema bằng Zod
const bullEnvSchema = z.object({
	REDIS_HOST: z.string().default('localhost'),
	REDIS_PORT: z.coerce.number().default(6379), // coerce giúp chuyển string "6379" -> number 6379
	REDIS_PASSWORD: z.string().optional(),

	// Các biến optional khác cho Bull
	APP_CODE: z.string().default('CADSQUAD'),
})

// 2. Register Config
export const bullConfig = registerAs('bull', () => {
	// Validate process.env
	const parsed = bullEnvSchema.safeParse(process.env)

	if (!parsed.success) {
		console.error('❌ BullMQ/Redis Config Error:', parsed.error.format())
		throw new Error('Invalid BullMQ Configuration')
	}

	// Trả về object cấu hình đã được làm sạch
	return {
		connection: {
			host: parsed.data.REDIS_HOST,
			port: parsed.data.REDIS_PORT,
			password: parsed.data.REDIS_PASSWORD,
		},
		prefix: parsed.data.APP_CODE,
		defaultJobOptions: {
			removeOnComplete: true,
			removeOnFail: false,
			attempts: 3,
			backoff: {
				type: 'exponential',
				delay: 1000,
			},
		},
	}
})
