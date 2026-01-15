import { SetMetadata } from '@nestjs/common'

export const PERMISSIONS_KEY = 'permissions'

// Usage: @RequirePermissions('job.read', 'job.write')
export const RequirePermissions = (...permissions: string[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions)
