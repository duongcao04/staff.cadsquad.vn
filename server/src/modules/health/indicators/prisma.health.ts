import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../../../providers/prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async isHealthy(key: string): Promise<HealthIndicatorResult> {
		try {
			// Thử ping database bằng một query đơn giản
			await this.prisma.$queryRaw`SELECT 1`;
			return this.getStatus(key, true);
		} catch (error) {
			throw new HealthCheckError(
				'Prisma check failed',
				this.getStatus(key, false, { message: error.message }),
			);
		}
	}
}