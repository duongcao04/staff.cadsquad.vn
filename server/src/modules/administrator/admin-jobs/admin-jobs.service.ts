import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import lodash from 'lodash';
import { JobStatusSystemType, Prisma } from '../../../generated/prisma';
import { PrismaService } from '../../../providers/prisma/prisma.service';

@Injectable()
export class AdminJobsService {
	constructor(private readonly prisma: PrismaService) { }

	async getStatsData(
		dateRange: {
			from?: string,
			to?: string
		}) {
		const { from, to } = dateRange

		const today = dayjs().startOf('day').toDate()
		const fromDate = !lodash.isEmpty(from) ? dayjs(from).toDate() : null
		const toDate = !lodash.isEmpty(from) ? dayjs(to).toDate() : null

		const dateRangeCodition: Prisma.JobWhereInput = {
			...(fromDate && {
				startedAt: {
					gt: fromDate,
				},
			}),
			...(toDate && {
				dueAt: {
					lt: toDate,
				},
			}),
		}

		const notDeleted: Prisma.JobWhereInput = {
			deletedAt: null,
		}

		const [total, ongoing, delivered, late, finished] = await Promise.all([
			// total quey
			this.prisma.job.count({
				where: {
					AND: [
						dateRangeCodition,
						notDeleted
					]
				},
			}),
			// ongoing quey
			this.prisma.job.count({
				where: {
					AND: [
						dateRangeCodition,
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
						{
							dueAt: {
								lt: today,
							},
						}, notDeleted
					]
				}
			}),
			// delivered query
			this.prisma.job.count({
				where: {
					AND: [
						dateRangeCodition,
						{
							status: {
								systemType: JobStatusSystemType.DELIVERED,
							},
						}, notDeleted
					]
				}
			}),
			// late query
			this.prisma.job.count({
				where: {
					AND: [
						dateRangeCodition,
						{
							status: {
								systemType: {
									notIn: [
										JobStatusSystemType.COMPLETED,
										JobStatusSystemType.TERMINATED,
										JobStatusSystemType.DELIVERED,
									],
								},
							},
						},
						{
							dueAt: {
								lt: today,
							},
						}, notDeleted
					]
				}
			}),
			// finished query
			this.prisma.job.count({
				where: {
					AND: [
						dateRangeCodition,
						{
							status: {
								systemType: JobStatusSystemType.TERMINATED,
							},
						}, notDeleted
					]
				}
			}),
		])

		return {
			total, ongoing, delivered, late, finished
		}
	}
	async bulkUpdateStatus(jobIds: string[], statusId: string) {
		return this.prisma.job.updateMany({
			where: { id: { in: jobIds } },
			data: { statusId },
		});
	}

	async bulkDeleteJobs(jobIds: string[]) {
		// Nên check xem job đã thanh toán chưa trước khi cho xóa
		return this.prisma.job.deleteMany({
			where: { id: { in: jobIds } },
		});
	}
}