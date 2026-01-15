import { queryOptions } from "@tanstack/react-query"

import { analyticsApi } from "../../api"
import { TAnalyticsOverviewInput } from "../../validationSchemas"

export const analyticsOverviewOptions = (
	params: TAnalyticsOverviewInput
) => {
	return queryOptions({
		queryKey: [
			'analytics',
			'overview'
		],
		queryFn: () => analyticsApi.getOverview(params),
		// ✅ Select & Map data ngay tại đây
		select: (res) => {
			return {
				cards: {
					activeJobs: res.result?.cards.activeJobs ?? 0,
					overdue: res.result?.cards.overdue ?? 0,
					pendingReview: res.result?.cards.pendingReview ?? 0,
					waitingPayment: res.result?.cards.waitingPayment ?? 0
				},
				financialChart: {
					startDate: res.result?.financialChart.startDate ?? "",
					endDate: res.result?.financialChart.endDate ?? "",
					data: res.result?.financialChart.data ?? []
				},
				topPerformers: res.result?.topPerformers ?? []
			}
		},
	})
}