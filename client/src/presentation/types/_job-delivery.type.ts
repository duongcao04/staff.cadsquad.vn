import { TUser } from "./_user.type"

export type TJobDelivery = {
	id: string

	jobId: string

	userId: string

	user: TUser

	note?: string

	files: TJobDeliverFile[]

	status: 'PENDING' | 'APPROVED' | 'REJECTED'

	adminFeedback: string | null

	createdAt: string | Date

	updatedAt: string | Date
}

export type TJobDeliverFile = {
	id: string
	fileName: string
	webUrl: string
	sharepointId?: string

	createdAt: string | Date
	updatedAt: string | Date
}