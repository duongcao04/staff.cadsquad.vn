import {
	mutationOptions,
	queryOptions
} from '@tanstack/react-query'
import { administratorApi, IAdminDbStats, jobApi } from '../../api'
import { onErrorToast } from '../helper'

// ==========================================
// QUERIES
// ==========================================

export const adminDashboardKeys = {
	resource: ['admin-dashboard'] as const,
	kpis: () => [...adminDashboardKeys.resource, 'kpis'] as const,
	dbStats: () => [...adminDashboardKeys.resource, 'db-stats'] as const,
}

export const adminJobKeys = {
	resource: ['admin-jobs'] as const,
	stats: () => [...adminJobKeys.resource, 'stats'] as const,
}

export const adminDashboardKpisOptions = () =>
	queryOptions({
		queryKey: adminDashboardKeys.kpis(),
		queryFn: () => administratorApi.dashboard.getKpis(),
		select(data) {
			return data.result
		},
	})

export const adminDashboardDbStatsOptions = () =>
	queryOptions({
		queryKey: adminDashboardKeys.dbStats(),
		queryFn: () => administratorApi.dashboard.getDbStats(),
		select(res) {
			const data = res.result
			const dbStats: IAdminDbStats = {
				auth: {
					roles: data?.auth.roles ?? 0,
					users: data?.auth.users ?? 0,
				},
				jobs: {
					actives: data?.jobs.actives ?? 0,
					total: data?.jobs.total ?? 0,
					pendingReviews: data?.jobs.pendingReviews ?? 0,
					pendingPayouts: data?.jobs.pendingPayouts ?? 0
				},
				clients: {
					total: data?.clients.total ?? 0
				}
			}
			return dbStats
		},
	})


export interface IAdminJobStats {
	total: number,
	ongoing: number,
	delivered: number,
	late: number,
	finished: number
}
export const adminJobStatsOptions = ({ from, to }: { from?: string, to?: string }) =>
	queryOptions({
		queryKey: adminJobKeys.stats(),
		queryFn: () => administratorApi.jobs.getStats({ from, to }),
		select(data) {
			const result = data.result as IAdminJobStats
			return result
		},
	})

// ==========================================
// MUTATIONS
// ==========================================

// --- USERS ---
export const adminToggleUserStatusMutation = () => mutationOptions({
	mutationFn: ({
		userId,
		isActive,
	}: {
		userId: string
		isActive: boolean
	}) => administratorApi.users.toggleStatus(userId, isActive),
})

export const adminForceLogoutMutation = () => mutationOptions({
	mutationFn: (userId: string) =>
		administratorApi.users.forceLogout(userId),
})

export const adminDeleteUserMutation = () => mutationOptions({
	mutationFn: (userId: string) =>
		administratorApi.users.deleteUser(userId),
})

// --- JOBS ---
export const adminBulkUpdateJobStatusMutation = () => mutationOptions({
	mutationFn: (payload: { jobIds: string[]; statusId: string }) =>
		administratorApi.jobs.bulkUpdateStatus(payload),
})

export const adminBulkDeleteJobsMutation = () => mutationOptions({
	mutationFn: (payload: { jobIds: string[] }) =>
		administratorApi.jobs.bulkDelete(payload),
})


export const adminReviewJobDeliverOptions = mutationOptions({
	mutationFn: ({
		deliveryId,
		action,
		feedback,
	}: {
		deliveryId: string
		action: 'approve' | 'reject'
		feedback?: string
	}) => jobApi.adminDeliverJobAction(deliveryId, action, feedback),
	onError: (err) => onErrorToast(err, 'Review job failed'),
})