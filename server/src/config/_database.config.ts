import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const dbSchema = z.object({
	// Postgres
	DATABASE_URL: z.string().url(),
	POSTGRES_USER: z.string().min(1),
	POSTGRES_PASSWORD: z.string().min(1),
	POSTGRES_DB: z.string().min(1),
	POSTGRES_PORT: z.coerce.number().default(5432),
	POSTGRES_HOST: z.string().min(1),

	// Redis
	REDIS_HOST: z.string().default('localhost'),
	REDIS_PORT: z.coerce.number().default(6379),
	REDIS_PASSWORD: z.string().optional(),
})

export default registerAs('database', () => {
	const parsed = dbSchema.safeParse(process.env)
	if (!parsed.success) {
		console.error('❌ Database/Redis Config Error:', parsed.error.format())
		throw new Error('Invalid Database/Redis Configuration')
	}
	return {
		postgres: {
			url: parsed.data.DATABASE_URL,
			host: parsed.data.POSTGRES_HOST,
			port: parsed.data.POSTGRES_PORT,
			user: parsed.data.POSTGRES_USER,
			password: parsed.data.POSTGRES_PASSWORD,
			dbName: parsed.data.POSTGRES_DB,
		},
		redis: {
			host: parsed.data.REDIS_HOST,
			port: parsed.data.REDIS_PORT,
			password: parsed.data.REDIS_PASSWORD,
		},
	}
})
