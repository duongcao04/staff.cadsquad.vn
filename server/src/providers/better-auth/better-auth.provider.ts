import { appConfig, azureConfig } from '@/config'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { Provider } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

export const BETTER_AUTH = 'BETTER_AUTH'

export const BetterAuthProvider: Provider = {
	provide: BETTER_AUTH,
	inject: [PrismaService, azureConfig.KEY, appConfig.KEY],
	useFactory: (
		prisma: PrismaService,
		azConfig: ConfigType<typeof azureConfig>,
		config: ConfigType<typeof appConfig>
	) => {
		return betterAuth({
			database: prismaAdapter(prisma, {
				provider: 'postgresql',
			}),
			// QUAN TRỌNG: Cấu hình đường dẫn
			// baseURL: Domain backend (vd: http://localhost:8080)
			// basePath: Đường dẫn mount (vd: /api/v1/better-auth)
			baseURL: config.BACKEND_URL || 'http://localhost:8080',
			basePath: `${config.API_ENDPOINT}/v1/better-auth`,
			emailAndPassword: {
				enabled: true,
				autoSignIn: true, // Tự login sau khi đăng ký (tuỳ chọn)
			},
			socialProviders: {
				microsoft: {
					clientId: azConfig.azure.clientId,
					clientSecret: azConfig.azure.clientSecret,
					tenantId: azConfig.azure.tenantId,
				},
			},
			user: {
				modelName: 'User',
				fields: { image: 'avatar', name: 'displayName' },
			},
			// Tắt trustedOrigins check nếu dev local bị lỗi CORS với client khác port
			trustedOrigins: [config.CLIENT_URL, 'postman-token'],
		})
	},
}
