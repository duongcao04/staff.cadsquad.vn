export const EJobPaymentStatus = {
	PAID: 'PAID',
	PENDING: 'PENDING',
	UNPAID: "UNPAID",
	FAILED: "FAILED",
} as const
// 2. Tạo Type từ Object đó (để dùng cho biến/props)
export type EJobPaymentStatus =
	(typeof EJobPaymentStatus)[keyof typeof EJobPaymentStatus]
