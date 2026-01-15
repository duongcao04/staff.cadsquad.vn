import type { IJobResponse } from '../interfaces'
import { TUser } from './_user.type'

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

export type TJob = Omit<
    Required<IJobResponse>,
    'typeId' | 'createdById' | 'paymentChannelId' | 'statusId'
>

export type JobUpdateResponse = { id: string; no: string }

export type TJobAssignment = {
    id: string
    job: TJob
    user: TUser
    staffCost: number
    assignedAt: Date | string
}

export type TJobComment = {
    id: string
    content: string
    createdAt: Date | string
    updatedAt: Date | string
    user: TUser
    parentId?: string | null
    replies?: TJobComment[] // Đệ quy cho replies
}
