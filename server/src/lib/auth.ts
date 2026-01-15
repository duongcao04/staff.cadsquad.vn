import { azureConfig } from '@/config'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { Provider } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

export const BETTER_AUTH = 'BETTER_AUTH'

export const BetterAuthProvider: Provider = {
	provide: BETTER_AUTH,
	// Inject các dependency cần thiết
	inject: [PrismaService, azureConfig.KEY],

	useFactory: (
		prisma: PrismaService,
		config: ConfigType<typeof azureConfig>
	) => {
		return betterAuth({
			// Sử dụng PrismaService singleton của NestJS
			database: prismaAdapter(prisma, {
				provider: 'postgresql',
			}),

			socialProviders: {
				microsoft: {
					// Lấy từ Config đã validate (Zod)
					clientId: config.microsoft.clientId,
					clientSecret: config.microsoft.clientSecret,
					tenantId: config.microsoft.tenantId,
				},
			},

			user: {
				modelName: 'User',
				fields: {
					image: 'avatar', // Map avatar
				},
			},

			// Tắt log của better-auth nếu cần để terminal gọn hơn
			// logger: { disabled: true },
		})
	},
}
