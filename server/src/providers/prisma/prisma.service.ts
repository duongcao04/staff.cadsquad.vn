import { prismaConfig } from '@/config'
import { PrismaClient } from '@/generated/prisma'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor(
		@Inject(prismaConfig.KEY)
		private config: ConfigType<typeof prismaConfig>
	) {
		// 1. Tạo Connection Pool từ thư viện pg
		const pool = new Pool({
			connectionString: config.databaseUrl,
			ssl: config.nodeEnv === 'production' ? true : false,
		})

		// 2. Tạo Adapter
		const adapter = new PrismaPg(pool)

		// 3. Khởi tạo PrismaClient với adapter
		super({ adapter })
	}

	async onModuleInit() {
		await this.$connect()
	}
}
