import { TAnalyticsOverviewInput } from '@/lib/validationSchemas'
import { queryOptions } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'

export const analyticsOverviewOptions = (params: TAnalyticsOverviewInput) => {
    return queryOptions({
        // 1. Cần đưa params vào queryKey để tự động refetch khi filter thay đổi
        queryKey: [
            'analytics',
            'overview',
            params, // Thêm params vào đây
        ],

        // 2. Gọi API theo cấu trúc mới của analyticsApi
        queryFn: () => analyticsApi.getOverview(params),

        // 3. Mapping dữ liệu từ ApiResponse
        // Lưu ý: Kết quả từ analyticsApi trả về trực tiếp data (res.data)
        select: (res) => {
            const data = res.result // Truy cập vào result dựa trên ApiResponse cấu trúc của bạn

            return {
                cards: {
                    activeJobs: data?.cards.activeJobs ?? 0,
                    overdue: data?.cards.overdue ?? 0,
                    pendingReview: data?.cards.pendingReview ?? 0,
                    waitingPayment: data?.cards.waitingPayment ?? 0,
                },
                financialChart: {
                    startDate: data?.financialChart.startDate ?? '',
                    endDate: data?.financialChart.endDate ?? '',
                    // Đảm bảo map đúng format name/income cho Recharts
                    data: data?.financialChart.data ?? [],
                },
                topPerformers: data?.topPerformers ?? [],
            }
        },
        // Giữ dữ liệu cũ trong khi fetch mới để tránh flickering UI (optional)
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000, // Dữ liệu phân tích nên cache khoảng 5 phút
    })
}

/**
 * Options dành cho trang Overview cá nhân của User
 * /v1/analytics/user/overview
 */
export const profileOverviewOptions = (
    range: '7d' | '30d' | '90d' | 'ytd' = '30d'
) => {
    return queryOptions({
        queryKey: [
            'analytics',
            'user-overview',
            range, // QueryKey thay đổi theo range để tự động refetch
        ],
        queryFn: () => analyticsApi.getUserOverview(range),
        select: (res) => {
            const data = res.result // Truy cập vào kết quả trả về từ ApiResponse

            return {
                stats: {
                    // Map chính xác các label từ API vào UI
                    totalEarnings:
                        data?.stats?.find(
                            (s: any) => s.label === 'Total Earnings'
                        )?.value ?? '0 ₫',
                    jobsCompleted:
                        data?.stats?.find(
                            (s: any) => s.label === 'Jobs Completed'
                        )?.value ?? '0',
                    hoursLogged:
                        data?.stats?.find(
                            (s: any) => s.label === 'Hours Logged'
                        )?.value ?? '0',
                    activeJobs:
                        data?.stats?.find((s: any) => s.label === 'Active Jobs')
                            ?.value ?? '0',
                },
                charts: {
                    // Dữ liệu tài chính cá nhân (Earnings vs Revenue)
                    financialPerformance:
                        data?.charts?.financialPerformance ?? [],
                    // Phân bổ trạng thái công việc cá nhân
                    jobStatusDistribution:
                        data?.charts?.jobStatusDistribution ?? [],
                    // Hoạt động hàng ngày cá nhân
                    dailyActivity: data?.charts?.dailyActivity ?? [],
                },
                efficiency: data?.efficiency ?? {
                    onTimeDelivery: 0,
                    profileCompletion: 0,
                    clientSatisfaction: 0,
                },
            }
        },
        staleTime: 5 * 60 * 1000, // Cache dữ liệu trong 5 phút
    })
}
