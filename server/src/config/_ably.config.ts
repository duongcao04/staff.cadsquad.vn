import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const schema = z.object({
	ABLY_API_KEY: z.string().min(1),
})

export default registerAs('ably', () => {
	const parsed = schema.safeParse(process.env)
	if (!parsed.success) {
		console.error('❌ Ably Config Error:', parsed.error.format())
		throw new Error('Invalid Ably Configuration')
	}
	return {
		key: parsed.data.ABLY_API_KEY,
	}
})
