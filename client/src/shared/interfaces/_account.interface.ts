import { AccountProviderEnum } from '@/shared/enums'

import type { TUser } from '../types'

/**
 * Represents a user's linked account from an external provider (e.g., Google, GitHub).
 * This interface stores details about the authentication provider and links back to the primary user account.
 */
export interface IAccountResponse {
    /**
     * The unique identifier for the account record.
     * @type {string}
     */
    id?: string

    /**
     * The authentication provider, such as GOOGLE, GITHUB, etc.
     * @type {AccountProviderEnum}
     */
    provider?: AccountProviderEnum

    /**
     * The unique identifier for the user within the external provider's system.
     * @type {string}
     */
    providerId?: string

    /**
     * The ID of the user in the local system that this external account is linked to.
     * @type {string}
     */
    userId?: string

    /**
     * A reference to the full User object associated with this account.
     * @type {User}
     */
    user?: TUser
}
