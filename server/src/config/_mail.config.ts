import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const mailSchema = z.object({
	MAIL_HOST: z.string().min(1),
	MAIL_PORT: z.coerce.number().default(465),
	MAILER_SECURE: z.coerce.boolean().default(true), // Chuyển chuỗi "true" thành boolean
	MAIL_USER: z.string().email(),
	MAIL_PASS: z.string().min(1),
	MAIL_FROM: z.string().min(1),
	MAIL_TEMPLATE_PATH: z.string().min(1),
})

export const mailConfig = registerAs('mail', () => {
	const parsed = mailSchema.safeParse(process.env)
	if (!parsed.success) {
		console.error('❌ Mail Config Error:', parsed.error.format())
		throw new Error('Invalid Mail Configuration')
	}
	return parsed.data
})
