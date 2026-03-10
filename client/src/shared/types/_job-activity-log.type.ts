import { ActivityTypeEnum } from '@/shared/enums';
import { TUser } from './_user.type';

export interface TJobActivityLog {
    /**
     * The unique identifier for the activity log entry.
     * @type {string}
     */
    id: string;

    /**
     * The type of activity that was performed (e.g., "ChangeStatus", "AssignMember").
     * @type {ActivityTypeEnum}
     */
    activityType: ActivityTypeEnum;

    metadata?: any;
    requiredPermissionCode: string | null;

    /**
     * The value of the field before the change.
     * Can be undefined if it's a creation event.
     * @type {string | undefined}
     */
    previousValue?: string;

    /**
     * The value of the field after the change.
     * Can be undefined if it's a creation event.
     * @type {string | undefined}
     */
    currentValue?: string;

    /**
     * The name of the field that was changed (e.g., "statusId", "assignee").
     * @type {string}
     */
    fieldName: string;

    /**
     * The user who performed the modification.
     * @type {User}
     */
    modifiedBy?: TUser;

    /**
     * The timestamp when the modification occurred.
     * @type {Date}
    */
    modifiedAt: Date;

    /**
     * Optional notes or comments about the activity.
     * @type {string | undefined}
     */
    notes?: string;
}