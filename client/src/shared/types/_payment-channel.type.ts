import { EPaymentChannelType } from '../enums'
import type { TJob } from '../types'

/**
 * Represents a payment channel, such as a bank account or online payment service.
 * It is used to track financial transactions related to jobs.
 */
export type TPaymentChannel = {
	/**
	 * The unique identifier for the payment channel.
	 * @type {string}
	 */
	id: string

	/**
	 * The human-readable name of the payment channel (e.g., "Bank of America", "PayPal").
	 * @type {string}
	 */
	displayName: string

	/**
	 * An optional hexadecimal color code for UI display.
	 * @type {string | undefined}
	 */
	hexColor?: string

	type: EPaymentChannelType

	accountDetails?: string

	feeRate?: number
	fixedFee?: number
	totalVolume?: number
	totalFees?: number

	isActive: boolean

	/**
	 * An optional URL for the logo of the payment channel.
	 * @type {string | undefined}
	 */
	logoUrl?: string

	/**
	 * The name of the account owner.
	 * @type {string | undefined}
	 */
	ownerName?: string

	/**
	 * The account or card number, which may be partially masked for security.
	 * @type {string | undefined}
	 */
	cardNumber?: string

	/**
	 * A list of jobs that have used this payment channel.
	 * @type {Job[]}
	 */
	jobs: TJob[]
}
