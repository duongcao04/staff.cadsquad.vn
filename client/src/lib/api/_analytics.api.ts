import { TUser } from '../../shared/types'
import { ApiResponse, axiosClient } from '../axios'
import { TAnalyticsOverviewInput } from '../validationSchemas'

export interface AnalyticsOverview {
    cards: {
        activeJobs: number
        overdue: number
        pendingReview: number
        waitingPayment: number
    }
    financialChart: {
        startDate: string
        endDate: string
        data: {
            name: string // Định dạng hiển thị như "Jan 15"
            income: number
        }[]
    }
    // Mở rộng thông tin performer để hiển thị trên bảng xếp hạng
    topPerformers: Array<
        TUser & {
            totalIncome: number
            jobsCount: number
        }
    >
}

export const analyticsApi = {
    /**
     * Lấy dữ liệu tổng quan hệ thống (Admin Dashboard)
     */
    getOverview: async (params: TAnalyticsOverviewInput) => {
        return axiosClient
            .get<ApiResponse<AnalyticsOverview>>(
                '/v1/analytics/system/overview',
                {
                    params,
                }
            )
            .then((res) => res.data)
    },

    /**
     * Lấy dữ liệu Dashboard cá nhân cho User
     */
    getUserOverview: async (range: '7d' | '30d' | '90d' | 'ytd' = '30d') => {
        return axiosClient
            .get<ApiResponse<any>>('/v1/analytics/user/overview', {
                params: { range },
            })
            .then((res) => res.data)
    },
}
