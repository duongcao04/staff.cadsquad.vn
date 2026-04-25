import { SetMetadata } from '@nestjs/common'

export const PERMISSIONS_KEY = 'permissions'

// Usage: @RequirePermissions(['job.read', 'job.write'])
// Or:    @RequirePermissions(['job.read', 'job.write'], true)
export const RequirePermissions = (
	permissions: string[],
	requiredAll: boolean = false
) => {
	// You MUST return SetMetadata
	return SetMetadata(PERMISSIONS_KEY, {
		permissions,
		requiredAll,
	})
}
