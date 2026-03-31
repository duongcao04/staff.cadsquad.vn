import { EJobPaymentStatus } from '@/shared/enums'

export const getJobPaymentStatusDisplay: (status?: EJobPaymentStatus) => {
	title: string
	hexColor: string
	colorName:
	| 'success'
	| 'primary'
	| 'warning'
	| 'danger'
	| 'default'
	| 'secondary'
	| undefined
} = (status) => {
	switch (status) {
		case 'PAID':
			return { title: 'Paid', hexColor: '#2a9174', colorName: 'success' }
		case 'UNPAID':
			return {
				title: 'Unpaid',
				hexColor: '#747a81',
				colorName: 'primary',
			}
		case 'PENDING':
			return {
				title: 'Pending',
				hexColor: '#daa521',
				colorName: 'warning',
			}
		case 'FAILED':
			return { title: 'Failed', hexColor: '#f83640', colorName: 'danger' }
		default:
			return { title: 'Failed', hexColor: '#f83640', colorName: 'danger' }
	}
}
