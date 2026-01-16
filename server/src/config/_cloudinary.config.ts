import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const schema = z.object({
	CLOUDINARY_NAME: z.string().min(1),
	CLOUDINARY_API_KEY: z.string().min(1),
	CLOUDINARY_API_SECRET: z.string().min(1),
	CLOUDINARY_FOLDER_ROOT: z.string().default('App'),
})

export const cloudinaryConfig = registerAs('cloudinary', () => {
	const parsed = schema.safeParse(process.env)
	if (!parsed.success) {
		console.error('❌ Cloudinary Config Error:', parsed.error.format())
		throw new Error('Invalid Cloudinary Configuration')
	}
	return {
		cloudName: parsed.data.CLOUDINARY_NAME,
		apiKey: parsed.data.CLOUDINARY_API_KEY,
		apiSecret: parsed.data.CLOUDINARY_API_SECRET,
		folder: parsed.data.CLOUDINARY_FOLDER_ROOT,
	}
})
