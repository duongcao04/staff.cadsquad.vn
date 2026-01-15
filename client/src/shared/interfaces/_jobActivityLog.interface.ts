import { ActivityTypeEnum } from '@/shared/enums'

import type { TUser } from '../types'

/**
 * Represents a log entry for an activity performed on a job.
 * This is used to track the history of a job, such as status changes, assignments, and updates.
 */
export interface IJobActivityLogResponse {
    /**
     * The unique identifier for the activity log entry.
     * @type {string}
     */
    id?: string

    requiredPermissionCode?: string | null

    metadata: any

    /**
     * The value of the field before the change.
     * Can be null if it's a creation event.
     * @type {string | null | undefined}
     */
    previousValue?: string | null

    /**
     * The value of the field after the change.
     * @type {string | null | undefined}
     */
    currentValue?: string | null

    /**
     * The timestamp when the modification occurred.
     * @type {Date}
     */
    modifiedAt?: Date | string

    /**
     * The user who performed the modification.
     * @type {User}
     */
    modifiedBy?: TUser

    /**
     * The ID of the user who performed the modification.
     * @type {string}
     */
    modifiedById?: string

    /**
     * The name of the field that was changed (e.g., "statusId", "assignee").
     * @type {string}
     */
    fieldName?: string

    /**
     * The type of activity that was performed (e.g., "ChangeStatus", "AssignMember").
     * @type {ActivityTypeEnum}
     */
    activityType?: ActivityTypeEnum

    /**
     * Optional notes or comments about the activity.
     * @type {string | null | undefined}
     */
    notes?: string | null
}
