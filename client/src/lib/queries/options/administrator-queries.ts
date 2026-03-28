import {
	mutationOptions,
	queryOptions
} from '@tanstack/react-query'
import { administratorApi, jobApi } from '../../api'
import { onErrorToast } from '../helper'

// ==========================================
// QUERIES
// ==========================================

export const adminDashboardKeys = {
	resource: ['admin-dashboard'] as const,
	kpis: () => [...adminDashboardKeys.resource, 'kpis'] as const,
	dbStats: () => [...adminDashboardKeys.resource, 'db-stats'] as const,
	dbOverview: () => [...adminDashboardKeys.resource, 'db-overview'] as const,
}

export const adminJobKeys = {
	resource: ['admin-jobs'] as const,
	stats: () => [...adminJobKeys.resource, 'stats'] as const,
}

export const adminDashboardKpisOptions = () =>
	queryOptions({
		queryKey: adminDashboardKeys.kpis(),
		queryFn: () => administratorApi.dashboard.getKpis(),
		select(res) {
			return res.result
		},
	})

export const adminDashboardOvewviewOptions = () =>
	queryOptions({
		queryKey: adminDashboardKeys.dbOverview(),
		queryFn: () => administratorApi.dashboard.getDbOverview(),
		select(res) {
			const data = res.result
			return {
				users: Number(data.users) || 0,
				staff: Number(data.staff) || 0,
				roles: Number(data.roles) || 0,
				permissions: Number(data.permissions) || 0,
				departments: Number(data.departments) || 0,
				jobTitles: Number(data.jobTitles) || 0,
				jobTypes: Number(data.jobTypes) || 0,
				jobs: Number(data.jobs) || 0,
				clients: Number(data.clients) || 0,
				jobDeliveres: Number(data.jobDeliveres) || 0,
				jobFinished: Number(data.jobFinished) || 0,
				communities: Number(data.communities) || 0,
				posts: Number(data.posts) || 0,
				jobComments: Number(data.jobComments) || 0,
				fileSystems: Number(data.fileSystems) || 0,
				folderTemplates: Number(data.folderTemplates) || 0,
				paymentChannels: Number(data.paymentChannels) || 0,
				payouts: Number(data.payouts) || 0,
			}
		},
	})

export const adminDashboardDbStatsOptions = () =>
	queryOptions({
		queryKey: adminDashboardKeys.dbStats(),
		queryFn: () => administratorApi.dashboard.getDbStats(),
		select(res) {
			const data = res.result
			const dbStats = {
				auth: {
					roles: data?.auth.roles ?? 0,
					users: data?.auth.users ?? 0,
				},
				jobs: {
					actives: data?.jobs.actives ?? 0,
					total: data?.jobs.total ?? 0,
					pendingReviews: data?.jobs.pendingReviews ?? 0,
					pendingPayouts: data?.jobs.pendingPayouts ?? 0,
					countByStatus: data?.jobs.countByStatus
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