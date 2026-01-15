import { JobStatusSystemType } from '@/generated/prisma'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { AnalyticsOverviewDto } from './dto/analytics-overview.dto'

// Load plugins
dayjs.extend(isSameOrBefore)

@Injectable()
export class AnalyticsService {
	constructor(private prisma: PrismaService) {}

	async getUserOverview(userId: string) {
		const now = new Date()
		const thirtyDaysAgo = new Date()
		thirtyDaysAgo.setDate(now.getDate() - 30)

		// 1. Lấy thống kê cơ bản
		const [completedJobs, activeJobs] = await Promise.all([
			this.prisma.jobAssignment.count({
				where: {
					userId,
					job: {
						status: {
							systemType: JobStatusSystemType.TERMINATED,
						},
					},
				},
			}),
			this.prisma.jobAssignment.count({
				where: {
					userId,
					job: {
						status: {
							systemType: { not: JobStatusSystemType.TERMINATED },
						},
					},
				},
			}),
		])

		// 2. Tính toán Financial Performance (Dựa trên Job Assignments)
		const financialData = await this.prisma.jobAssignment.findMany({
			where: { userId, assignedAt: { gte: thirtyDaysAgo } },
			select: {
				assignedAt: true,
				staffCost: true,
				job: { select: { incomeCost: true } },
			},
		})

		// 3. Logic tính toán Efficiency Metrics (Ví dụ: On-time delivery)
		// So sánh job.dueAt với job.completedAt

		return {
			stats: {
				totalEarnings: 0, // Tính sum staffCost
				jobsCompleted: completedJobs,
				hoursLogged: 0,
				activeJobs: activeJobs,
			},
			financialChart: this.formatFinancialData(financialData),
			efficiency: {
				onTimeDelivery: 92,
				profileCompletion: 85,
				clientSatisfaction: 4.8,
			},
		}
	}

	async getOverview(query: AnalyticsOverviewDto, userId: string) {
		const today = dayjs()

		// 1. Default Date Range (30 days if not provided)
		const startDate = query.startDate
			? dayjs(query.startDate).startOf('day')
			: today.subtract(30, 'day').startOf('day')

		const endDate = query.endDate
			? dayjs(query.endDate).endOf('day')
			: today.endOf('day')

		// --- 1. CARDS DATA ---
		const [activeJobs, overdueJobs, pendingReview, waitingPayment] =
			await Promise.all([
				this.prisma.job.count({
					where: {
						status: {
							systemType: { notIn: ['COMPLETED', 'TERMINATED'] },
						},
					},
				}),
				this.prisma.job.count({
					where: {
						dueAt: { lt: today.toDate() },
						status: {
							systemType: { notIn: ['COMPLETED', 'TERMINATED'] },
						},
					},
				}),
				this.prisma.job.count({
					where: {
						status: { code: { in: ['inprogressing', 'revision'] } },
					},
				}),
				this.prisma.job.count({
					where: {
						status: { systemType: 'COMPLETED' },
						isPaid: false,
					},
				}),
			])

		// --- 2. FINANCIAL OVERVIEW ---
		// Fetch daily data from the reusable analytics method
		const financialData = await this.getRevenueAnalytics(
			startDate.toISOString(),
			endDate.toISOString(),
			'day'
		)

		// Map to the specific format for your frontend chart: { name: 'Aug 01', income: 4000 }
		const financialChart = financialData.map((item) => ({
			name: dayjs(item.dateObj).format('MMM DD'), // Formats '2024-08-01' to 'Aug 01'
			income: item.incomeCost,
		}))
		// --- 3. TOP PERFORMERS (Sorted by Assignee Number / Job Count) ---
		let performerStartDate = today.subtract(7, 'day').startOf('day')
		if (query.period === '1m')
			performerStartDate = today.subtract(1, 'month').startOf('day')
		if (query.period === '1y')
			performerStartDate = today.subtract(1, 'year').startOf('day')

		const performers = await this.prisma.user.findMany({
			where: {
				isActive: true,
				// Only consider users who actually finished jobs in this period
				jobAssignments: {
					some: {
						job: {
							finishedAt: { gte: performerStartDate.toDate() },
						},
						// TODO: Chỉ lấy job đã hoàn thành
						// status: { systemType: 'COMPLETED' }
					},
				},
			},
			select: {
				id: true,
				displayName: true,
				email: true,
				avatar: true,
				// Fetch only the relevant completed jobs to count them accurately for this period
				jobAssignments: {
					where: {
						job: {
							AND: [
								{
									finishedAt: {
										gte: performerStartDate.toDate(),
									},
								},
								{ status: { systemType: 'COMPLETED' } },
							],
						},
					},
					select: {
						job: {
							select: {
								incomeCost: true,
							},
						},
					},
				},
			},
		})

		const topPerformers = performers
			.map((user) => {
				const totalIncome = user.jobAssignments.reduce(
					(sum, ass) => sum + ass.job.incomeCost,
					0
				)
				return {
					id: user.id,
					displayName: user.displayName,
					email: user.email,
					avatar: user.avatar,
					totalIncome,
					jobsCount: user.jobAssignments.length, // This is the "assignee number" for this period
				}
			})
			// CHANGED: Sort by jobsCount descending (Highest number of finished jobs first)
			.sort((a, b) => b.jobsCount - a.jobsCount)
			.slice(0, 5)

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
				data: financialChart, // <--- Returns your desired format
			},
			topPerformers,
		}
	}

	/**
	 * Reusable Analytics Engine
	 * Generates time-series data filling in "zero" for empty days/months.
	 */
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

		// Align iterator to start of unit (day or month)
		if (unit === 'month') iterator = iterator.startOf('month')
		if (unit === 'day') iterator = iterator.startOf('day')

		const endIterator = endDate

		// Internal key format for matching
		const formatKey = unit === 'day' ? 'YYYY-MM-DD' : 'YYYY-M'

		// Loop to create "buckets" (even empty ones)
		while (iterator.isSameOrBefore(endIterator, unit)) {
			result.push({
				key: iterator.format(formatKey),
				dateObj: iterator.toDate(), // Save raw date object for easy formatting later
				incomeCost: 0,
			})
			iterator = iterator.add(1, unit)
		}

		// Fill Buckets
		jobs.forEach((job) => {
			const key = dayjs(job.finishedAt).format(formatKey)
			const bucket = result.find((r) => r.key === key)
			if (bucket) {
				bucket.incomeCost += job.incomeCost || 0
			}
		})

		return result
	}

	private formatFinancialData(assignments: any[]) {
		// 1. Khởi tạo một Map để gom dữ liệu theo ngày
		const dataMap = new Map<
			string,
			{ date: string; revenue: number; earnings: number }
		>()

		assignments.forEach((item) => {
			// Chuyển đổi date về định dạng YYYY-MM-DD
			const dateStr = new Date(item.assignedAt)
				.toISOString()
				.split('T')[0]

			const existing = dataMap.get(dateStr) || {
				date: dateStr,
				revenue: 0,
				earnings: 0,
			}

			// Cộng dồn Revenue (Doanh thu dự án) và Earnings (Tiền nhân viên kiếm được)
			existing.revenue += item.job?.incomeCost || 0
			existing.earnings += item.staffCost || 0

			dataMap.set(dateStr, existing)
		})

		// 2. Chuyển Map thành Array và sắp xếp theo ngày tăng dần
		return Array.from(dataMap.values()).sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		)
	}
}
