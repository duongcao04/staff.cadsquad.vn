import { EClientType } from '../enums'
import { TJob } from './_job.type'

export type TClient = {
	id: string
	name: string
	code: string
	type: EClientType
	region: string | null
	country: string | null
	address: string | null
	timezone: string | null
	email: string | null
	phoneNumber: string | null
	billingEmail: string | null
	taxId: string | null
	currency: string | null
	paymentTerms: number | null
	jobs: TJob[]
	createdAt: Date | string
	updatedAt: Date | string
}
