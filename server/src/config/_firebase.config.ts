import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const schema = z.object({
	FIREBASE_PROJECT_ID: z.string().min(1),
	FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
	FIREBASE_PRIVATE_KEY: z.string().min(1),
	FIREBASE_DATABASE_URL: z.string().url().optional(),
	// Các key client-side khác nếu backend cần dùng thì thêm vào đây
	FIREBASE_API_KEY: z.string().min(1),
	FIREBASE_APP_ID: z.string().min(1),
})

export default registerAs('firebase', () => {
	const parsed = schema.safeParse(process.env)
	if (!parsed.success) {
		console.error('❌ Firebase Config Error:', parsed.error.format())
		throw new Error('Invalid Firebase Configuration')
	}
	return parsed.data
})
