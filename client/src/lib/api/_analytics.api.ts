import { TUser } from "../../shared/types"
import { ApiResponse, axiosClient } from "../axios"
import { TAnalyticsOverviewInput } from "../validationSchemas"

export interface AnalyticsOverview {
    cards: {
        activeJobs: number,
        overdue: number,
        pendingReview: number,
        waitingPayment: number
    },
    financialChart: {
        startDate: string,
        endDate: string,
        data: {
            date: string,
            value: number
        }[]
    },
    topPerformers: Array<TUser>
}

export const analyticsApi = {
    getOverview: async (params: TAnalyticsOverviewInput) => {
        return axiosClient.get<ApiResponse<AnalyticsOverview>>('/v1/analytics/overview', {
            params
        }).then(res => res.data)
    }
}
