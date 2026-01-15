import type { TJob } from '../types'

/**
 * Represents a category or type of job (e.g., "Drafting", "3D Modeling").
 * This helps in organizing and filtering jobs.
 */
export interface IJobTypeResponse {
    /**
     * The unique identifier for the job type.
     * @type {string}
     */
    id?: string

    /**
     * A unique code for the job type.
     * @type {string}
     */
    code?: string

    /**
     * The human-readable name of the job type.
     * @type {string}
     */
    displayName?: string

    /**
     * An optional hexadecimal color code for UI display.
     * @type {string | null | undefined}
     */
    hexColor?: string | null

    /**
     * A list of jobs that belong to this type.
     * @type {Job[]}
     */
    jobs?: TJob[]

    _count?: Record<string, string>
}
