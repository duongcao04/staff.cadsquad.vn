import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator'
import { AuthService } from '../../modules/auth/auth.service'

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly authService: AuthService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()]
        )

        if (!requiredPermissions) {
            return true
        }

        const { user } = context.switchToHttp().getRequest()

        // Check if user exists (Safety check)
        if (!user || !user.sub) {
            throw new UnauthorizedException('User not found in request')
        }

        // Check Effective Permissions
        const userEffectivePermissions =
            await this.authService.getEffectivePermissions(user.sub)

        const hasPermission = requiredPermissions.some((req) =>
            userEffectivePermissions.includes(req)
        )

        if (!hasPermission) {
            throw new ForbiddenException(
                `Missing required permission: ${requiredPermissions.join(', ')}`
            )
        }

        return true
    }
}
