import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../../../providers/prisma/prisma.service';

@Injectable()
export class DbTableHealthIndicator extends HealthIndicator {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	// Hàm check tổng quát cho bất kỳ bảng nào
	async isHealthy(key: string): Promise<HealthIndicatorResult> {
		const errors: string[] = [];
		const checkedTables = ['User', 'Session', 'Account', 'Verification', 'Gallery', 'Comment', 'Job', 'JobTitle', 'Department', 'Config', 'Config', 'PaymentChannel', 'JobType', 'JobStatus', 'JobStatusHistory', 'JobActivityLog', 'Notification', 'FileSystem', 'BrowserSubscribes', 'UserDevices']; // Danh sách bảng muốn check

		// Dùng Promise.all để check song song cho nhanh
		await Promise.all(
			checkedTables.map(async (tableName) => {
				try {
					// Query nhẹ nhất: Lấy 1 record đầu tiên
					// Dùng (this.prisma as any)[tableName] để gọi dynamic key
					await (this.prisma as any)[String(tableName)].findFirst({
						select: { id: true },
					});
				} catch (e) {
					errors.push(`${tableName}: ${e.message}`);
				}
			}),
		);

		if (errors.length > 0) {
			throw new HealthCheckError(
				'Database table check failed',
				this.getStatus(key, false, { errors }),
			);
		}

		return this.getStatus(key, true, { checked: checkedTables });
	}
}