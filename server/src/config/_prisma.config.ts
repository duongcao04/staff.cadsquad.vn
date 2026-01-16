import { registerAs } from '@nestjs/config'
import path from 'node:path'
import { z } from 'zod'

// 1. Define Zod Schema for Environment Variables
const prismaSchema = z.object({
	DATABASE_URL: z.string().url().min(1), // Ensures it is a valid URL
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
})

export const prismaConfig = registerAs('prisma', () => {
	// 2. Validate process.env
	const parsed = prismaSchema.safeParse(process.env)

	if (!parsed.success) {
		console.error('❌ Prisma Config Error:', parsed.error.format())
		throw new Error('Invalid Prisma Configuration')
	}

	// 3. Return the structured configuration object
	return {
		// The validated connection string
		databaseUrl: parsed.data.DATABASE_URL,
		nodeEnv: parsed.data.NODE_ENV,

		// Static paths (kept from your original code if you need to inject them)
		paths: {
			schema: path.join(
				process.cwd(),
				'src',
				'providers',
				'prisma',
				'schema.prisma'
			),
			migrations: path.join(
				process.cwd(),
				'src',
				'providers',
				'prisma',
				'migrations'
			),
		},
	}
})
