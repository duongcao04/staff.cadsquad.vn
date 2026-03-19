import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { JobStatusSystemType } from '../../../generated/prisma'
import { PrismaService } from '../../../providers/prisma/prisma.service'

@Injectable()
export class AdminDashboardService {
	constructor(private readonly prisma: PrismaService) { }

	async getOverviewKpis() {
		const today = dayjs().startOf('day').toDate()
		const oneWeekDay = dayjs().add(1, 'week').startOf('day').toDate()
		const [topClients, urgentJobs, activeJobs, totalClients, totalStaff] =
			await Promise.all([
				this.prisma.client
					.findMany({
						orderBy: {
							jobs: {
								_count: 'desc',
							},
						},
						include: {
							jobs: {
								select: { id: true, incomeCost: true },
							},
						},
					})
					.then((res) => res.splice(0, 4)),
				this.prisma.job.findMany({
					where: {
						AND: [
							{
								deletedAt: null,
							},
							{
								dueAt: {
									gt: today,
									lt: oneWeekDay,
								},
							},
							{
								status: {
									systemType: {
										notIn: [
											JobStatusSystemType.COMPLETED,
											JobStatusSystemType.TERMINATED,
										],
									},
								},
							},
						],
					},
					include: {
						client: true,
					},
				}),
				this.prisma.job.count({
					where: {
						status: {
							systemType: { notIn: ['COMPLETED', 'TERMINATED'] },
						},
					},
				}),
				this.prisma.client.count(),
				this.prisma.user.count({ where: { isActive: true } }),
			])

		// Tính toán doanh thu (Mock ví dụ)
		const revenueTarget = 50000
		const currentRevenue = await this.prisma.job.aggregate({
			_sum: { incomeCost: true },
			where: { isPaid: true },
		})

		return {
			kpis: {
				topClients,
				urgentJobs,
				activeJobs,
				totalClients,
				totalStaff,
			},
			revenue: {
				target: revenueTarget,
				current: currentRevenue._sum.incomeCost || 0,
			},
		}
	}

	async getDatabaseStats() {
		const today = dayjs().startOf('day').toDate()
		return {
			auth: {
				users: await this.prisma.user.count(),
				roles: await this.prisma.role.count(),
			},
			jobs: {
				total: await this.prisma.job.count(),
				actives: (
					await this.prisma.job.findMany({
						where: {
							AND: [
								{
									deletedAt: null,
								},
								{
									dueAt: {
										gt: today,
									},
								},
								{
									status: {
										systemType: {
											notIn: [
												JobStatusSystemType.COMPLETED,
												JobStatusSystemType.TERMINATED,
											],
										},
									},
								},
							],
						},
					})
				).length,
				pendingReviews: (
					await this.prisma.job.findMany({
						where: {
							status: { systemType: 'DELIVERED' },
						},
					})
				).length,
				pendingPayouts: (
					await this.prisma.job.findMany({
						where: {
							AND: [
								{
									status: { systemType: 'COMPLETED' },
								},
								{
									isPaid: false,
								},
							],
						},
					})
				).length,
			},
			clients: {
				total: await this.prisma.client.count(),
			},
		}
	}
}
