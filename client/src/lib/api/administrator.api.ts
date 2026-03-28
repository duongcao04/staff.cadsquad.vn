import queryString from 'query-string'
import { TClient, TJob, TJobStatus } from '../../shared/types'
import { ApiResponse, axiosClient } from '../axios'

export interface IAdminDashboardKpis {
	kpis: {
		topClients: TClient[]
		activeJobs: number,
		urgentJobs: TJob[]
		totalClients: number
		totalStaff: number
	}
	revenue: {
		target: number
		current: number
	}
}

export type ICountByStatus = Pick<TJobStatus, 'displayName' | 'hexColor'> & {
	_count: { jobs: number }
}
export interface IAdminDbStats {
	auth: { users: number; roles: number }
	jobs: {
		total: number
		actives: number
		pendingReviews: number, pendingPayouts: number
		countByStatus: ICountByStatus[]
	}
	clients: {
		total: number
	}
}

export interface IBulkUpdateJobStatusPayload {
	jobIds: string[]
	statusId: string
}

export interface IBulkDeleteJobsPayload {
	jobIds: string[]
}

// ==========================================
// API ENDPOINTS
// ==========================================
export const administratorApi = {
	dashboard: {
		getKpis: async (): Promise<ApiResponse<IAdminDashboardKpis>> => {
			const { data } = await axiosClient.get('/v1/admin/dashboard/kpis')
			return data
		},
		getDbStats: async (): Promise<ApiResponse<IAdminDbStats>> => {
			const { data } = await axiosClient.get(
				'/v1/admin/dashboard/db-stats'
			)
			return data
		},
		getDbOverview: async (): Promise<ApiResponse<any>> => {
			const { data } = await axiosClient.get(
				'/v1/admin/dashboard/db-overview'
			)
			return data
		},
	},

	users: {
		toggleStatus: async (userId: string, isActive: boolean) => {
			const { data } = await axiosClient.patch(
				`/v1/admin/users/${userId}/status`,
				{ isActive }
			)
			return data
		},
		forceLogout: async (userId: string) => {
			const { data } = await axiosClient.post(
				`/v1/admin/users/${userId}/force-logout`
			)
			return data
		},
		deleteUser: async (userId: string) => {
			const { data } = await axiosClient.delete(
				`/v1/admin/users/${userId}`
			)
			return data
		},
	},

	jobs: {
		getStats: async ({ from, to }: { from?: string, to?: string }) => {
			const queryStringFormatter = queryString.stringify({ from, to })
			const { data } = await axiosClient.get(
				`/v1/admin/jobs/stats?${queryStringFormatter}`,
			)
			return data
		},
		bulkUpdateStatus: async (payload: IBulkUpdateJobStatusPayload) => {
			const { data } = await axiosClient.post(
				'/v1/admin/jobs/bulk-status',
				payload
			)
			return data
		},
		bulkDelete: async (payload: IBulkDeleteJobsPayload) => {
			const { data } = await axiosClient.post(
				'/v1/admin/jobs/bulk-delete',
				payload
			)
			return data
		},
	},
}
