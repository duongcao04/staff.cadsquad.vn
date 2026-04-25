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
		// 1. Read the metadata object (permissions array + requiredAll flag)
		const metadata = this.reflector.getAllAndOverride<{
			permissions: string[]
			requiredAll: boolean
		}>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()])

		// If no permissions are required, allow access
		if (
			!metadata ||
			!metadata.permissions ||
			metadata.permissions.length === 0
		) {
			return true
		}

		const { user } = context.switchToHttp().getRequest()

		// Check if user exists (Safety check)
		if (!user || !user.sub) {
			throw new UnauthorizedException('User not found in request')
		}

		// Fetch Effective Permissions from the database/service
		const userEffectivePermissions =
			await this.authService.getEffectivePermissions(user.sub)

		// 2. Helper function to check exact match OR 'manage' bypass
		const checkPermission = (requiredPermission: string): boolean => {
			// If they have the exact permission (e.g., 'role.delete')
			if (userEffectivePermissions.includes(requiredPermission)) {
				return true
			}

			// If they don't, check if they have the 'manage' permission for that resource
			const [resource] = requiredPermission.split('.')
			const managePermission = `${resource}.manage` // e.g., turns 'role.delete' into 'role.manage'

			return userEffectivePermissions.includes(managePermission)
		}

		// 3. Evaluate using every() or some() based on the requiredAll flag
		const hasPermission = metadata.requiredAll
			? metadata.permissions.every((req) => checkPermission(req))
			: metadata.permissions.some((req) => checkPermission(req))

		if (!hasPermission) {
			throw new ForbiddenException(
				`Missing required permission: ${metadata.permissions.join(', ')}`
			)
		}

		return true
	}
}
