import { TClient } from './_client.type'
import { TJobActivityLog } from './_job-activity-log.type'
import { TJobComment } from './_job-comment.type'
import { TJobDelivery } from './_job-delivery.type'
import { TJobStatus } from './_job-status.type'
import { TJobType } from './_job-type.type'
import { TPaymentChannel } from './_payment-channel.type'
import { TUser } from './_user.type'

export type TJob = {
    /**
     * The unique identifier for the job.
     * @type {string}
     */
    id: string

    /**
     * A unique, human-readable number or code for the job.
     * @type {string}
     */
    no: string

    /**
     * The type of the job (e.g., "Drafting", "Modeling").
     * @type {TJobType}
     */
    type: TJobType

    /**
     * The ID of the job's type.
     * @type {string}
     */
    typeId: string

    /**
     * The main display name or title of the job.
     * @type {string}
     */
    displayName: string

    /**
     * An optional detailed description of the job.
     * @type {string | undefined}
     */
    description?: string

    /**
     * A list of URLs for attachments related to the job.
     * @type {string[]}
     */
    attachmentUrls: string[]

    /**
     * The name of the client for whom the job is being done.
     * @type {TClient | undefined}
     */
    client?: TClient

    /**
     * The income generated from the job.
     * @type {number}
     */
    incomeCost: number

    /**
     * @type {IJobDelivery}
     */
    jobDeliveries?: TJobDelivery[]

    sharepointFolderId?: string

    /**
     * A list of comments.
     * @type {TJobComment[]}
     */
    comments?: TJobComment[]

    /**
     * The cost associated with the staff working on the job.
     * @type {number}
     */
    staffCost?: number

    /**
     * The total cost associated with the staffs working on the job.
     * @type {number}
     */
    totalStaffCost: number

    /**
     * A list of users assigned to work on the job.
     * @type {TJobAssignment[]}
     */
    assignments: TJobAssignment[]

    /**
     * The user who created the job.
     * @type {User}
     */
    createdBy: TUser

    /**
     * The ID of the user who created the job.
     * @type {string}
     */
    createdById: string

    /**
     * The payment channel used for the job's transactions.
     * @type {PaymentChannel}
     */
    paymentChannel?: TPaymentChannel

    /**
     * The ID of the payment channel.
     * @type {string}
     */
    paymentChannelId?: string

    /**
     * The current status of the job (e.g., "In Progress", "Completed").
     * @type {TJobStatus}
     */
    status: TJobStatus

    /**
     * The ID of the job's current status.
     * @type {string}
     */
    statusId: string

    /**
     * A log of all activities and changes related to the job.
     * @type {JobActivityLog[]}
     */
    activityLog: TJobActivityLog[]

    /**
     * The date and time when the job was started.
     * @type {Date}
     */
    startedAt: Date | string

    /**
     * A list of files and folders associated with the job.
     * @type {FileSystem[]}
     */
    files: FileSystem[]

    /**
     * A flag indicating whether the job is pinned for easy access.
     * @type {boolean}
     */
    isPinned: boolean

    /**
     * A flag indicating  whether the job is published or visible.
     * @type {boolean}
     */
    isPublished: boolean

    /**
     * A flag indicating whether the job has been paid for.
     * @type {boolean}
     */
    isPaid: boolean

    /**
     * The deadline for the job.
     * @type {Date}
     */
    dueAt: Date | string

    /**
     * The date and time when the job was completed.
     * Can be null if the job is not yet completed.
     * @type {Date | undefined}
     */
    completedAt?: Date

    /**
     * The date and time when the job was finish.
     * Can be null if the job is not yet finish.
     * @type {Date | undefined}
     */
    finishedAt?: Date

    /**
     * The date and time when the job was paid.
     * Can be null if the job is not yet paid.
     * @type {Date | undefined}
     */
    paidAt?: Date

    /**
     * The timestamp when the job was created.
     * @type {Date}
     */
    createdAt: Date | string

    /**
     * The timestamp when the job was last updated.
     * @type {Date}
     */
    updatedAt: Date | string

    /**
     * The timestamp when the job was soft-deleted.
     * Can be null if the job is active.
     * @type {Date | string | undefined}
     */
    deletedAt?: Date | string
}

export type JobColumnKey =
    | 'thumbnailUrl'
    | 'clientName'
    | 'type'
    | 'no'
    | 'description'
    | 'displayName'
    | 'incomeCost'
    | 'totalStaffCost'
    | 'staffCost'
    | 'status'
    | 'dueAt'
    | 'attachmentUrls'
    | 'assignments'
    | 'isPaid'
    | 'paymentChannel'
    | 'completedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'action'

export type JobUpdateResponse = { id: string; no: string }

export type TJobAssignment = {
    id: string
    job: TJob
    user: TUser
    staffCost: number
    assignedAt: Date | string
}