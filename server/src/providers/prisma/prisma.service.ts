import { databaseConfig } from '@/config'
import { PrismaClient } from '@/generated/prisma'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor(
		@Inject(databaseConfig.KEY)
		private readonly config: ConfigType<typeof databaseConfig>
	) {
		// 1. Tạo Connection Pool từ thư viện pg
		const pool = new Pool({
			connectionString: config.postgres.url, // Lấy từ config đã validate
			// Có thể thêm cấu hình SSL nếu deploy production (Render/Heroku/Neon...)
			// ssl: process.env.NODE_ENV === 'production' ? true : false,
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
