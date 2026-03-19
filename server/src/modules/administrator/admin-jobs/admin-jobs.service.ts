import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';

@Injectable()
export class AdminJobsService {
	constructor(private readonly prisma: PrismaService) { }

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