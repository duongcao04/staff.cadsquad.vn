import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service'; // ⚠️ Adjust this path
import { SystemModule } from '../../generated/prisma';

@Processor('audit-logs')
export class AuditLogProcessor extends WorkerHost {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async process(job: Job<any, any, string>): Promise<any> {
		const logData = job.data;

		console.log(`[Audit Worker] Processing log for action: ${logData.module}`);

		try {
			await this.prisma.systemAuditLog.create({
				data: {
					// 1. WHO did it?
					actorId: logData.actorId || null, // null represents a System action

					// 2. WHAT did they do?
					action: logData.action,
					// Default to 'SYSTEM' module if one isn't explicitly provided
					module: logData.module || SystemModule.SYSTEM,

					// 3. TO WHAT entity?
					targetId: logData.targetId || null,
					// targetDisplay is required in your schema, so we need a fallback just in case
					targetDisplay: logData.targetDisplay || 'Unknown Target',

					// 4. THE DATA
					// Prisma handles native JS objects for Json fields, no need to JSON.stringify!
					oldValues: logData.oldValues || undefined,
					newValues: logData.newValues || undefined,

					// We can tuck the HTTP request context into the metadata field
					metadata: logData.metadata || {
						method: logData.method,
						url: logData.url,
						status: logData.status,
						error: logData.error,
					},

					// 5. SECURITY CONTEXT
					ipAddress: logData.ipAddress || null,
					userAgent: logData.userAgent || null,
				},
			});

			console.log(`[Audit Worker] Successfully saved log: ${logData.action}`);
		} catch (error) {
			console.error(`[Audit Worker] Failed to save audit log:`, error);
			// Throwing the error allows BullMQ to catch it, mark the job as failed, and retry it later!
			throw error;
		}
	}
}