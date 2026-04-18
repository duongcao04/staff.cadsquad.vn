import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { TokenPayload } from './dto/token-payload.dto'
import { SessionService } from './session.service'
import { TokenService } from './token.service'

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(
        private tokenService: TokenService,
        private prisma: PrismaService,
        private sessionService: SessionService // Inject thêm SessionService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. Get token from header
        const request = context.switchToHttp().getRequest()
        const token = this.extractTokenFromHeader(request)
        const sessionId = request.headers['x-session-id']

        // 2. Validate token
        if (!token) {
            throw new UnauthorizedException('Certificate is invalid')
        }

        try {
            const payload: TokenPayload =
                await this.tokenService.verifyToken(token)

            // 2. Kiểm tra Blacklist/Revoke qua SessionService (Redis)
            // Giả sử payload của bạn có { sub: userId, sid: sessionId }
            const isSessionValid = await this.sessionService.isValidSession(
                payload.sub,
                sessionId
            )

            if (!isSessionValid) {
                throw new UnauthorizedException(
                    'Your login session has been revoked or expired'
                )
            }

            // 3. Truy vấn Database kiểm tra trạng thái User (isActive)
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, isActive: true },
            })

            if (!user) {
                throw new UnauthorizedException('User no longer exists')
            }

            if (!user.isActive) {
                throw new ForbiddenException(
                    'Your account has been deactivated'
                )
            }

            // Gán thông tin vào request để dùng ở Controller
            request['user'] = payload

            return true
        } catch (error) {
            // Chuyển tiếp các lỗi cụ thể hoặc ném lỗi chung
            if (error instanceof ForbiddenException) throw error
            throw new UnauthorizedException(
                error.message || 'Certificate is invalid'
            )
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }
}
