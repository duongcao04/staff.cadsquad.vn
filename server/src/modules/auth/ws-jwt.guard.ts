import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { TokenService } from './token.service'

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private tokenService: TokenService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient<Socket>()
        const token = this.extractToken(client)

        if (!token) {
            throw new WsException('Unauthorized: No token provided')
        }

        try {
            const payload = await this.tokenService.verifyToken(token)
            client.data.user = payload // Attach user payload to the socket
        } catch (e) {
            client.disconnect()
            throw new WsException('Unauthorized: Invalid token')
        }
        return true
    }

    private extractToken(client: Socket): string | null {
        const fromAuth = client.handshake?.auth?.token
        if (fromAuth) return fromAuth as string

        const authHeader = client.handshake?.headers?.authorization as
            | string
            | undefined
        if (!authHeader) return null
        const [type, token] = authHeader.split(' ')
        return type === 'Bearer' && token ? token : null
    }
}
