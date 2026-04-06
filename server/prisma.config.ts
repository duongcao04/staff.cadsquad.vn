import { ConfigService } from '@nestjs/config'
import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import path from 'node:path'
import type { PrismaConfig } from 'prisma'

const envPath = fs.existsSync(path.resolve(process.cwd(), '.env'))
	? path.resolve(process.cwd(), '.env')
	: path.resolve(process.cwd(), '../.env')

dotenv.config({ path: envPath })

const configService = new ConfigService(process.env)

export default {
	schema: path.join('src', 'providers', 'prisma', 'schema'),
	migrations: {
		path: path.join('src', 'providers', 'prisma', 'migrations'),
	},
	datasource: {
		url: configService.getOrThrow<string>('DATABASE_URL'),
	},
} satisfies PrismaConfig
