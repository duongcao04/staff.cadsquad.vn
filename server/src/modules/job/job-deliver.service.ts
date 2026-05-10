import {
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'

@Injectable()
export class JobDeliverService {
	constructor(private readonly prisma: PrismaService) {}

	async getDeliveriesByJob(jobId: string) {
		// Check if job exists first
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
		})

		if (!job) throw new NotFoundException('Job not found')

		return this.prisma.jobDelivery.findMany({
			where: { jobId },
			include: {
				user: {
					select: {
						id: true,
						displayName: true,
						avatar: true,
						username: true,
					},
				},
				files: {},
			},
			orderBy: { createdAt: 'desc' }, // Latest delivery first
		})
	}

	/**
	 * Helper method to delete a specific delivered file if needed
	 */
	async deleteJobDeliverFile(fileId: string) {
		const file = await this.prisma.jobDeliverFile.findUnique({
			where: { id: fileId },
		})

		if (!file) {
			throw new NotFoundException('File not found')
		}

		return await this.prisma.jobDeliverFile.delete({
			where: { id: fileId },
		})
	}
}
