import { JobStatusSystemTypeEnum } from '../enums/_job-status-system-type.enum'
import type { TJob } from '../types'

/**
 * Represents the status of a job within a workflow.
 * Each status has properties that define its appearance and position in the sequence.
 */
export interface IJobStatusResponse {
    /**
     * The unique identifier for the job status.
     * @type {string}
     */
    id?: string

    /**
     * The human-readable name of the status (e.g., "To Do", "In Progress").
     * @type {string}
     */
    displayName?: string

    /**
     * An optional URL for a thumbnail image representing the status.
     * @type {string | null | undefined}
     */
    thumbnailUrl?: string

    /**
     * The hexadecimal color code associated with the status for UI display.
     * @type {string}
     */
    hexColor?: string

    /**
     * The order of this status in the workflow sequence.
     * @type {number}
     */
    order?: number

    /**
     * The unique code.
     * @type {number}
     */
    code?: string

    /**
     * Định nghĩa các nhóm logic hệ thống quan tâm
     * @type {JobStatusSystemTypeEnum} DEFAULT(STANDARD)
     * STANDARD // Trạng thái bình thường (To do, In Progress...)
     * COMPLETED // Đã làm xong việc (nhưng chưa đóng hồ sơ)
     * TERMINATED // Kết thúc vòng đời (Finished, Cancelled, Closed...)
     */
    systemType?: JobStatusSystemTypeEnum

    /**
     * An optional icon identifier to be displayed with the status.
     * @type {string | null | undefined}
     */
    icon?: string | null

    /**
     * The order of the next status in the workflow.
     * Can be null if this is the last status.
     * @type {number | null | undefined}
     */
    nextStatusOrder?: number | null

    /**
     * The order of the previous status in the workflow.
     * Can be null if this is the first status.
     * @type {number | null | undefined}
     */
    prevStatusOrder?: number | null

    /**
     * A list of jobs that currently have this status.
     * @type {Job[]}
     */
    jobs?: TJob[]

    /**
     * The timestamp when the job status was created.
     * @type {Date}
     */
    createdAt?: Date | string

    /**
     * The timestamp when the job status was last updated.
     * @type {Date}
     */
    updatedAt?: Date | string
}
