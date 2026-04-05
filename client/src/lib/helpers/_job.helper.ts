import { EJobPaymentStatus } from '@/shared/enums'
import lodash from 'lodash'
import { TJob } from '../../shared/types'


interface IJobPaymentStatusDisplayResult {
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
}
export class JobHelper {
	static isFinished(data: TJob) {
		return !lodash.isNil(data.finishedAt) || data.status.systemType === 'TERMINATED'
	}

	static isCompleted(data: TJob) {
		return !lodash.isNil(data.completedAt) || data.status.systemType === 'COMPLETED'
	}

	static isDelivered(data: TJob) {
		return data.status.systemType === 'DELIVERED'
	}

	static isCancelled(data: TJob) {
		return !lodash.isNil(data.deletedAt)
	}

	static isPayout(data: TJob) {
		return data.paymentStatus === 'PAID'
	}

	static canPayout(data: TJob, withPermission?: boolean) {
		return withPermission && (!this.isCompleted(data) && !this.isFinished(data) && !this.isPayout(data))
	}

	static canDelivery(data: TJob, withPermission?: boolean) {
		return withPermission && (!this.isCompleted(data) && !this.isFinished(data) && !this.isDelivered(data))
	}

	static getSharepointDisplay(data: TJob) {
		const result = {
			folderName: 'Unlinked',
			url: data?.sharepointFolder?.webUrl || data?.folderTemplate?.webUrl || null
		}
		if (!data?.sharepointFolder && !data?.folderTemplate) {
			result.folderName = 'Unlinked'
		}
		if (data?.sharepointFolder) {
			result.folderName =
				data?.sharepointFolder.displayName ||
				data?.sharepointFolder.itemId
		} else {
			result.folderName = data?.folderTemplate?.folderName || data?.folderTemplate?.folderId || 'Unlinked'
		}
		return result

	}

	static getJobPaymentStatusDisplay(status?: EJobPaymentStatus) {
		switch (status) {
			case 'PAID':
				return { title: 'Paid', hexColor: '#2a9174', colorName: 'success' } as IJobPaymentStatusDisplayResult
			case 'UNPAID':
				return {
					title: 'Unpaid',
					hexColor: '#747a81',
					colorName: 'default',
				} as IJobPaymentStatusDisplayResult
			case 'PENDING':
				return {
					title: 'Pending',
					hexColor: '#daa521',
					colorName: 'warning',
				} as IJobPaymentStatusDisplayResult
			case 'FAILED':
				return { title: 'Failed', hexColor: '#f83640', colorName: 'danger' } as IJobPaymentStatusDisplayResult
			default:
				return {
					title: 'Unpaid',
					hexColor: '#747a81',
					colorName: 'primary',
				} as IJobPaymentStatusDisplayResult
		}
	}
}
