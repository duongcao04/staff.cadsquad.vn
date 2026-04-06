import { JobStatusSystemType } from '@/generated/prisma'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { AnalyticsOverviewDto } from './dto/analytics-overview.dto'

dayjs.extend(isSameOrBefore)

@Injectable()
export class AnalyticsService {
	constructor(private prisma: PrismaService) { }

	async getUserDashboard(
		userId: string,
		range: '7d' | '30d' | '90d' | 'ytd'
	) {
		const { start, end, prevStart } = this.getDateRange(range)

		// Chạy song song các query để tối ưu hiệu năng
		const [
			stats,
			financialPerformance,
			jobStatusDistribution,
			dailyActivity,
			efficiency,
		] = await Promise.all([
			this.getSummaryStats(userId, start, end, prevStart),
			this.getFinancialPerformance(userId, start, end),
			this.getJobStatusDistribution(userId),
			this.getDailyActivity(userId),
			this.getEfficiencyMetrics(userId),
		])

		return {
			stats,
			charts: {
				financialPerformance,
				jobStatusDistribution,
				dailyActivity,
			},
			efficiency,
		}
	}

	async getSystemOverview(query: AnalyticsOverviewDto, userId: string) {
		const today = dayjs()

		// 1. Xác định khoảng thời gian dựa trên Query DTO hoặc mặc định 30 ngày
		const startDate = query.startDate
			? dayjs(query.startDate).startOf('day')
			: today.subtract(30, 'day').startOf('day')

		const endDate = query.endDate
			? dayjs(query.endDate).endOf('day')
			: today.endOf('day')

		// --- 2. DỮ LIỆU THẺ THỐNG KÊ (CARDS) ---
		// Sử dụng Promise.all để tối ưu tốc độ truy vấn song song
		const [activeJobs, overdueJobs, pendingReview, waitingPayment] =
			await Promise.all([
				// Công việc đang hoạt động (Chưa hoàn thành hoặc chưa kết thúc)
				this.prisma.job.count({
					where: {
						status: {
							systemType: { notIn: ['COMPLETED', 'TERMINATED'] },
						},
					},
				}),
				// Công việc quá hạn (Ngày đến hạn nhỏ hơn hiện tại)
				this.prisma.job.count({
					where: {
						dueAt: { lt: today.toDate() },
						status: {
							systemType: { notIn: ['COMPLETED', 'TERMINATED'] },
						},
					},
				}),
				// Công việc đang chờ xem xét (Dựa trên code trạng thái cụ thể)
				this.prisma.job.count({
					where: {
						status: { code: { in: ['inprogressing', 'revision'] } },
					},
				}),
				// Công việc đã xong nhưng chưa thanh toán
				this.prisma.job.count({
					where: {
						status: { systemType: 'COMPLETED' },
						paymentStatus: 'PENDING',
					},
				}),
			])

		// --- 3. BIỂU ĐỒ TÀI CHÍNH (FINANCIAL OVERVIEW) ---
		// Tận dụng hàm getRevenueAnalytics đã viết sẵn để lấy dữ liệu chuỗi thời gian
		const financialData = await this.getRevenueAnalytics(
			startDate.toISOString(),
			endDate.toISOString(),
			'day' // Group theo ngày để vẽ biểu đồ đường mượt mà
		)

		const financialChart = financialData.map((item) => ({
			name: dayjs(item.dateObj).format('MMM DD'), // Định dạng 'Feb 01'
			income: item.incomeCost,
		}))

		// --- 4. NHÂN VIÊN XUẤT SẮC (TOP PERFORMERS) ---
		// Xác định thời gian bắt đầu tính xếp hạng dựa trên period (7d, 1m, 1y)
		let performerStartDate = today.subtract(7, 'day').startOf('day')
		if (query.period === '1m')
			performerStartDate = today.subtract(1, 'month').startOf('day')
		if (query.period === '1y')
			performerStartDate = today.subtract(1, 'year').startOf('day')

		const performers = await this.prisma.user.findMany({
			where: {
				isActive: true,
				jobAssignments: {
					some: {
						job: {
							finishedAt: { gte: performerStartDate.toDate() },
							status: { systemType: 'COMPLETED' },
						},
					},
				},
			},
			select: {
				id: true,
				displayName: true,
				email: true,
				avatar: true,
				jobAssignments: {
					where: {
						job: {
							finishedAt: { gte: performerStartDate.toDate() },
							status: { systemType: 'COMPLETED' },
						},
					},
					select: {
						job: { select: { incomeCost: true } },
					},
				},
			},
		})

		const topPerformers = performers
			.map((user) => ({
				id: user.id,
				displayName: user.displayName,
				email: user.email,
				avatar: user.avatar,
				totalIncome: user.jobAssignments.reduce(
					(sum, ass) => sum + ass.job.incomeCost,
					0
				),
				jobsCount: user.jobAssignments.length,
			}))
			.sort((a, b) => b.jobsCount - a.jobsCount) // Sắp xếp theo số lượng job hoàn thành
			.slice(0, 5) // Lấy top 5

		return {
			cards: {
				activeJobs,
				overdue: overdueJobs,
				pendingReview,
				waitingPayment,
			},
			financialChart: {
				startDate: startDate.toDate(),
				endDate: endDate.toDate(),
				data: financialChart,
			},
			topPerformers,
		}
	}

	async getRevenueAnalytics(
		from?: string,
		to?: string,
		unit: 'day' | 'month' = 'month'
	) {
		const now = dayjs()
		const startDate = from
			? dayjs(from).startOf('day')
			: now.startOf('year')
		const endDate = to ? dayjs(to).endOf('day') : now.endOf('day')

		if (!startDate.isValid() || !endDate.isValid())
			throw new Error('Invalid date')

		// 1. Lấy tất cả job đã hoàn thành trong khoảng thời gian
		const jobs = await this.prisma.job.findMany({
			where: {
				finishedAt: {
					gte: startDate.toDate(),
					lte: endDate.toDate(),
				},
				status: { systemType: 'COMPLETED' },
			},
			select: {
				finishedAt: true,
				incomeCost: true,
			},
		})

		const result: any[] = []
		let iterator = startDate.clone()

		// Căn chỉnh iterator theo đơn vị (ngày hoặc tháng)
		if (unit === 'month') iterator = iterator.startOf('month')
		if (unit === 'day') iterator = iterator.startOf('day')

		// Định dạng khóa để so sánh (VD: '2026-01-15' hoặc '2026-1')
		const formatKey = unit === 'day' ? 'YYYY-MM-DD' : 'YYYY-M'

		// 2. Tạo danh sách các mốc thời gian trống (Zero-filling)
		while (iterator.isSameOrBefore(endDate, unit)) {
			result.push({
				key: iterator.format(formatKey),
				dateObj: iterator.toDate(), // Giữ lại đối tượng Date để dễ format ở Frontend
				incomeCost: 0,
			})
			iterator = iterator.add(1, unit)
		}

		// 3. Đổ dữ liệu từ DB vào danh sách mốc thời gian
		jobs.forEach((job) => {
			const key = dayjs(job.finishedAt).format(formatKey)
			const bucket = result.find((r) => r.key === key)
			if (bucket) {
				bucket.incomeCost += job.incomeCost || 0
			}
		})

		return result
	}

	private async getSummaryStats(
		userId: string,
		start: Date,
		end: Date,
		prevStart: Date
	) {
		// Lấy dữ liệu kỳ hiện tại và kỳ trước để tính Trend
		const [currentAssignments, prevAssignments] = await Promise.all([
			this.prisma.jobAssignment.findMany({
				where: { userId, assignedAt: { gte: start, lte: end } },
				include: { job: { include: { status: true } } },
			}),
			this.prisma.jobAssignment.findMany({
				where: { userId, assignedAt: { gte: prevStart, lt: start } },
				include: { job: { include: { status: true } } },
			}),
		])

		const currentEarnings = currentAssignments.reduce(
			(sum, a) => sum + a.staffCost,
			0
		)
		const prevEarnings = prevAssignments.reduce(
			(sum, a) => sum + a.staffCost,
			0
		)

		return [
			{
				label: 'Total Earnings',
				value: `${currentEarnings.toLocaleString()} ₫`,
				trend: this.calculateTrend(currentEarnings, prevEarnings),
				color: 'success',
			},
			{
				label: 'Jobs Completed',
				value: currentAssignments
					.filter((a) => a.job.status.systemType === 'COMPLETED')
					.length.toString(),
				trend: '+5.2%', // Có thể tính tương tự earnings
				color: 'primary',
			},
			{
				label: 'Hours Logged',
				value: '0',
				trend: '-2.4%',
				color: 'secondary',
			},
			{
				label: 'Active Jobs',
				value: currentAssignments
					.filter((a) => a.job.status.systemType === 'STANDARD')
					.length.toString(),
				trend: '+12.5%',
				color: 'warning',
			},
		]
	}

	private async getDailyActivity(userId: string) {
		const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day').toDate()

		const activities = await this.prisma.jobActivityLog.findMany({
			where: {
				modifiedById: userId,
				modifiedAt: { gte: sevenDaysAgo },
			},
			select: { modifiedAt: true },
		})

		const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		const grouped = activities.reduce((acc, curr) => {
			const dayName = dayjs(curr.modifiedAt).format('ddd')
			acc[dayName] = (acc[dayName] || 0) + 1
			return acc
		}, {})

		return days.map((day) => ({
			day,
			value: grouped[day] || 0,
		}))
	}

	private async getJobStatusDistribution(userId: string) {
		const statuses = await this.prisma.jobStatus.findMany({
			include: {
				jobs: {
					where: { assignments: { some: { userId } } },
				},
			},
		})

		const totalJobs = statuses.reduce((sum, s) => sum + s.jobs.length, 0)

		return statuses.map((s) => ({
			label: s.displayName,
			value: s.jobs.length,
			color: s.hexColor,
			percentage:
				totalJobs > 0
					? Math.round((s.jobs.length / totalJobs) * 100)
					: 0,
		}))
	}

	// Helper tính toán xu hướng tăng trưởng
	private calculateTrend(current: number, previous: number): string {
		if (previous === 0) return current > 0 ? '+100%' : '0%'
		const diff = ((current - previous) / previous) * 100
		return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
	}

	private getDateRange(range: string) {
		const end = dayjs().endOf('day').toDate()
		let start: dayjs.Dayjs
		let daysDiff = 30

		switch (range) {
			case '7d':
				daysDiff = 7
				break
			case '90d':
				daysDiff = 90
				break
			case 'ytd':
				daysDiff = dayjs().diff(dayjs().startOf('year'), 'day')
				break
			default:
				daysDiff = 30
		}

		start = dayjs().subtract(daysDiff, 'day').startOf('day')
		const prevStart = start.subtract(daysDiff, 'day').toDate()

		return { start: start.toDate(), end, prevStart }
	}

	// Tích hợp formatFinancialData vào engine chính
	private async getFinancialPerformance(
		userId: string,
		start: Date,
		end: Date
	) {
		const data = await this.prisma.jobAssignment.findMany({
			where: { userId, assignedAt: { gte: start, lte: end } },
			include: { job: true },
		})

		return this.formatFinancialData(data)
	}

	private formatFinancialData(assignments: any[]) {
		const dataMap = new Map<
			string,
			{ date: string; revenue: number; earnings: number }
		>()

		assignments.forEach((item) => {
			const dateStr = dayjs(item.assignedAt).format('MMM DD')
			const existing = dataMap.get(dateStr) || {
				date: dateStr,
				revenue: 0,
				earnings: 0,
			}

			existing.revenue += item.job?.incomeCost || 0
			existing.earnings += item.staffCost || 0
			dataMap.set(dateStr, existing)
		})

		return Array.from(dataMap.values())
	}

	private async getEfficiencyMetrics(userId: string) {
		// Có thể thay thế logic giả định bằng cách query database thực tế
		return [
			{ label: 'On-Time Delivery', value: 92, color: 'success' },
			{ label: 'Profile Completion', value: 85, color: 'primary' },
			{
				label: 'Client Satisfaction (Avg)',
				value: 4.8,
				max: 5,
				color: 'warning',
			},
		]
	}
}
