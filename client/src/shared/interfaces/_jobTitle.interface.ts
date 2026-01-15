import type { TUser } from '../types'

/**
 * Represents a job title within the organization (e.g., "Software Engineer", "Project Manager").
 * It can be assigned to multiple users.
 */
export interface IJobTitleResponse {
    /**
     * The unique identifier for the job title.
     * @type {string}
     */
    id?: string

    /**
     * The human-readable name of the job title.
     * @type {string}
     */
    displayName?: string

    /**
     * Optional notes or a description for the job title.
     * @type {string | null | undefined}
     */
    notes?: string | null

    /**
     * A unique code or abbreviation for the job title.
     * @type {string}
     */
    code?: string

    /**
     * A list of users who hold this job title.
     * @type {TUser[]}
     */
    users?: TUser[]

    /**
     * The timestamp when the job title was created.
     * @type {Date}
     */
    createdAt?: Date | string

    /**
     * The timestamp when the job title was last updated.
     * @type {Date}
     */
    updatedAt?: Date | string
}
