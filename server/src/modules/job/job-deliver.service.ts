import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { ActivityType, JobStatusSystemType } from '../../generated/prisma'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { DeliverJobDto } from './dto/deliver-job.dto'; // Adjust path
import { CreateJobDeliverFileDto } from './dto/job-deliver-file/create-job-deliver-file.dto';

@Injectable()
export class JobDeliverService {
	constructor(private readonly prisma: PrismaService) { }

	async deliverJob(userId: string, jobId: string, dto: DeliverJobDto) {
		// 1. Verify the job exists
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
		})

		if (!job) {
			throw new NotFoundException('Job not found')
		}

		// 2. Get the "DELIVERED" status ID to update the job
		// Based on your schema's JobStatusSystemType enum
		const deliveredStatus = await this.prisma.jobStatus.findFirst({
			where: { systemType: JobStatusSystemType.DELIVERED },
		})

		if (!deliveredStatus) {
			throw new BadRequestException(
				'System status "DELIVERED" is not configured in the database.'
			)
		}

		// 3. Execute everything in a transaction to ensure data integrity
		return await this.prisma.$transaction(async (tx) => {
			// A. Create the Job Delivery and the nested Files
			const delivery = await tx.jobDelivery.create({
				data: {
					jobId,
					userId,
					note: dto.note,
					link: dto.link,
					// Prisma nested write to create files simultaneously
					files: {
						create: dto.files?.map((file) => ({
							fileName: file.fileName,
							webUrl: file.webUrl,
							sharepointId: file.sharepointId,
						})) || [],
					},
				},
				include: {
					files: true,
				},
			})

			// B. Update the Job's status
			await tx.job.update({
				where: { id: jobId },
				data: {
					statusId: deliveredStatus.id,
				},
			})

			// C. Close the previous JobStatusHistory and start a new one
			const currentHistory = await tx.jobStatusHistory.findFirst({
				where: { jobId, endedAt: null },
				orderBy: { startedAt: 'desc' },
			})

			if (currentHistory) {
				await tx.jobStatusHistory.update({
					where: { id: currentHistory.id },
					data: {
						endedAt: new Date(),
						durationSeconds: Math.floor(
							(new Date().getTime() -
								currentHistory.startedAt.getTime()) /
							1000
						),
					},
				})
			}

			// Create new history record for DELIVERED status
			await tx.jobStatusHistory.create({
				data: {
					jobId,
					statusId: deliveredStatus.id,
					changedById: userId,
				},
			})

			// D. Log the activity
			await tx.jobActivityLog.create({
				data: {
					jobId,
					modifiedById: userId,
					activityType: ActivityType.DELIVER,
					fieldName: 'Status',
					currentValue: `Delivered: ${dto.note}`,
					notes: 'Job delivered for review',
				},
			})

			// Optional: E. You could trigger a Notification here to the job creator/manager
			/*
			await tx.notification.create({
				data: {
					userId: job.createdById, // Notify the person who created the job
					senderId: userId,
					type: 'JOB_DELIVERED',
					content: `Job #${job.no} has been delivered.`,
					redirectUrl: `/jobs/${job.id}`,
				}
			})
			*/

			return delivery
		})
	}

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
				files: {}
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
		});

		if (!file) {
			throw new NotFoundException('File not found');
		}

		return await this.prisma.jobDeliverFile.delete({
			where: { id: fileId },
		});
	}
}