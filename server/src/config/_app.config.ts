import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const appSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	BACKEND_PORT: z.coerce.number().default(8000),
	CLIENT_URL: z.string().url(),
	BACKEND_URL: z.string().url(),
	APP_CODE: z.string().default('CADSQUAD'),
	APP_VERSION: z.string().default('release-0.0.0.1'),
	APP_TITLE: z.string().default('Cadsquad Gov'),
	API_PREFIX: z.string().optional(),
	WS_URL: z.string().url().optional(),

	// VAPID Keys (Web Push)
	VAPID_PUBLIC_KEY: z.string().min(1),
	VAPID_PRIVATE_KEY: z.string().min(1),

	// Paths
	DATA_PATH: z.string().default('./data'),
	MONITORING_PATH: z.string().default('./monitoring'),
	LOG_PATH: z.string().default('./logs'),
})

export const appConfig = registerAs('app', () => {
	const parsed = appSchema.safeParse(process.env)
	if (!parsed.success) {
		console.error('❌ APP Config Error:', parsed.error.format())
		throw new Error('Invalid App Configuration')
	}
	return parsed.data
})
