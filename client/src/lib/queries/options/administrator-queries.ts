import { addToast } from '@heroui/react'
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query'
import { administratorApi, IAdminDbStats } from '../../api'

// ==========================================
// QUERIES
// ==========================================

export const adminDashboardKeys = {
	all: ['admin-dashboard'] as const,
	kpis: () => [...adminDashboardKeys.all, 'kpis'] as const,
	dbStats: () => [...adminDashboardKeys.all, 'db-stats'] as const,
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

// ==========================================
// MUTATIONS
// ==========================================

// --- USERS ---
export const useAdminToggleUserStatusMutation = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({
			userId,
			isActive,
		}: {
			userId: string
			isActive: boolean
		}) => administratorApi.users.toggleStatus(userId, isActive),
		onSuccess: (data, variables) => {
			addToast({
				title: 'User status updated successfully',
				color: 'success',
			})
			// Invalidate query để cập nhật lại danh sách staff
			queryClient.invalidateQueries({ queryKey: ['users'] })
			queryClient.invalidateQueries({
				queryKey: ['user', variables.userId],
			})
		},
	})
}

export const useAdminForceLogoutMutation = () => {
	return useMutation({
		mutationFn: (userId: string) =>
			administratorApi.users.forceLogout(userId),
		onSuccess: () => {
			addToast({ title: 'User sessions terminated', color: 'success' })
		},
	})
}

export const useAdminDeleteUserMutation = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (userId: string) =>
			administratorApi.users.deleteUser(userId),
		onSuccess: () => {
			addToast({ title: 'User deleted permanently', color: 'success' })
			queryClient.invalidateQueries({ queryKey: ['users'] })
		},
	})
}

// --- JOBS ---
export const useAdminBulkUpdateJobStatusMutation = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: { jobIds: string[]; statusId: string }) =>
			administratorApi.jobs.bulkUpdateStatus(payload),
		onSuccess: () => {
			addToast({
				title: 'Jobs status updated successfully',
				color: 'success',
			})
			queryClient.invalidateQueries({ queryKey: ['jobs'] }) // Refresh job list
		},
	})
}

export const useAdminBulkDeleteJobsMutation = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: { jobIds: string[] }) =>
			administratorApi.jobs.bulkDelete(payload),
		onSuccess: () => {
			addToast({
				title: 'Selected jobs deleted permanently',
				color: 'success',
			})
			queryClient.invalidateQueries({ queryKey: ['jobs'] })
		},
	})
}
