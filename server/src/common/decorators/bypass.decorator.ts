import { SetMetadata } from '@nestjs/common'

export const BYPASS_KEY = 'bypass_interceptor'

// This decorator will set a metadata key 'bypass_interceptor' to true
export const BypassTransform = () => SetMetadata(BYPASS_KEY, true)
