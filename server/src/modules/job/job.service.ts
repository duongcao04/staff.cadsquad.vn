import { PrismaService } from '@/providers/prisma/prisma.service'
import {
	Injectable,
	Logger
} from '@nestjs/common'

@Injectable()
export class JobService {
	private readonly logger = new Logger(JobService.name)

	constructor(
		private readonly prisma: PrismaService,
	) { }

	// -------------------------------------------------------------------------
	// UTILS
	// -------------------------------------------------------------------------
	async togglePin(userId: string, jobId: string) {
		const existing = await this.prisma.pinnedJob.findUnique({
			where: { userId_jobId: { userId, jobId } },
		})
		if (existing) {
			await this.prisma.pinnedJob.delete({
				where: { userId_jobId: { userId, jobId } },
			})
			return { isPinned: false }
		}
		await this.prisma.pinnedJob.create({ data: { userId, jobId } })
		return { isPinned: true }
	}

}
