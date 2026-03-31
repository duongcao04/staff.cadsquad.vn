import { appConfig, databaseConfig } from '@/config'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '../../generated/prisma'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor(
		@Inject(databaseConfig.KEY)
		private dbConfig: ConfigType<typeof databaseConfig>,
		@Inject(appConfig.KEY)
		private config: ConfigType<typeof appConfig>
	) {
		// 1. Tạo Connection Pool từ thư viện pg
		const pool = new Pool({
			connectionString: dbConfig.postgres.url,
			ssl: false,
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
