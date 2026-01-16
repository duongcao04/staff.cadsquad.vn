import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const authSchema = z.object({
	BCRYPT_SALT_ROUNDS: z.coerce.number().min(1).default(10),
	JWT_SECRET_KEY: z.string().min(10, 'Secret must be at least 10 chars'),
	JWT_EXPIRES_AT: z.coerce.number().default(86400000), // Supports string like "1d" or ms number string
})

export const authConfig = registerAs('auth', () => {
	const parsed = authSchema.safeParse(process.env)
	if (!parsed.success) {
		console.error('❌ Auth Config Error:', parsed.error.format())
		throw new Error('Invalid Auth Configuration')
	}
	return {
		saltRounds: parsed.data.BCRYPT_SALT_ROUNDS,
		jwt: {
			secret: parsed.data.JWT_SECRET_KEY,
			expiresIn: parsed.data.JWT_EXPIRES_AT,
		},
	}
})
