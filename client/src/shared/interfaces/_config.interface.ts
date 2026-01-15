import type { TUser } from '../types'

/**
 * Represents a configuration setting within the system.
 * This can be a user-specific preference or a global system parameter.
 */
export interface IConfigResponse {
    /**
     * The unique identifier for the configuration entry.
     * @type {string}
     */
    id: string

    /**
     * The ID of the user this configuration belongs to.
     * If null, it is a system-wide configuration.
     * @type {string | null | undefined}
     */
    userId?: string | null

    /**
     * A reference to the User object if this is a user-specific configuration.
     * @type {TUser | null | undefined}
     */
    user?: TUser | null

    /**
     * A human-readable name for the configuration setting.
     * @type {string}
     */
    displayName: string

    /**
     * A human-readable description for the configuration setting.
     * @type {string | undefined}
     */
    description?: string

    /**
     * A unique key or code for identifying the configuration setting programmatically.
     * @type {string}
     */
    code: string

    /**
     * The value of the configuration setting, stored as a string.
     * The value may need to be parsed depending on its intended type (e.g., JSON, boolean).
     * @type {string}
     */
    value: string

    /**
     * The timestamp when the configuration entry was created.
     * @type {Date}
     */
    createdAt: Date

    /**
     * The timestamp when the configuration entry was last updated.
     * @type {Date}
     */
    updatedAt: Date
}
