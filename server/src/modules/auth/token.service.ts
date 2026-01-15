import { authConfig } from '@/config'
import { User } from '@/generated/prisma'
import { PrismaService } from '@/providers/prisma/prisma.service'
import {
	forwardRef,
	Inject,
	Injectable,
	Logger,
	UnauthorizedException,
} from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from './auth.service'

@Injectable()
export class TokenService {
	private readonly logger = new Logger(TokenService.name)

	constructor(
		private readonly jwtService: JwtService,
		private readonly prismaService: PrismaService,
		@Inject(forwardRef(() => AuthService))
		private readonly authService: AuthService,
		@Inject(authConfig.KEY)
		private readonly config: ConfigType<typeof authConfig>
	) {}

	async signToken(user: User) {
		// 1. Lấy role code
		const userData = await this.prismaService.user.findUnique({
			where: { id: user.id },
			select: { role: { select: { code: true } } },
		})

		// 2. Lấy permissions
		const userPermissions = await this.authService.getEffectivePermissions(
			user.id
		)

		// 3. Tạo Payload (Không cần iat thủ công)
		const payload = {
			sub: user.id,
			email: user.email,
			role: userData?.role?.code,
			permissions: userPermissions,
		}

		try {
			// 4. Sign token dùng config
			const token = await this.jwtService.signAsync(payload, {
				secret: this.config.jwt.secret,
				expiresIn: this.config.jwt.expiresIn,
			})
			return token
		} catch (error) {
			this.logger.error(`Error signing token: ${error}`)
			throw error
		}
	}

	async verifyToken(token: string) {
		try {
			// 👇 verifyAsync tự động throw lỗi nếu hết hạn hoặc sai secret
			const payload = await this.jwtService.verifyAsync(token, {
				secret: this.config.jwt.secret,
			})
			return payload
		} catch (error) {
			// Bắt lỗi và ném ra 401 Unauthorized
			throw new UnauthorizedException('Token invalid or expired')
		}
	}

	async getAccessToken(user: User) {
		const accessToken = await this.signToken(user)
		const decoded = this.jwtService.decode(accessToken) as { exp: number }

		return {
			token: accessToken,
			// exp là giây (Unix), nhân 1000 để ra mili-giây cho JS/Frontend
			expiresAt: decoded.exp,
		}
	}
}
