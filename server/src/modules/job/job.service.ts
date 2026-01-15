import { PaginationMeta } from '@/common/interfaces/pagination-meta.interface'
import { ActivityType, Job, NotificationType, Prisma } from '@/generated/prisma'
import { AuthService } from '@/modules/auth/auth.service'
import { NotificationService } from '@/modules/notification/notification.service'
import { UserService } from '@/modules/user/user.service'
import { PrismaService } from '@/providers/prisma/prisma.service'
import { APP_PERMISSIONS } from '@/utils/_app-permissions'
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import dayjs from 'dayjs'
import slugify from 'slugify'
import { IMAGES } from '../../utils'
import { ActivityLogService } from './activity-log.service'
import { AssignMemberDto, UpdateAssignmentDto } from './dto/assign-member.dto'
import { ChangeStatusDto } from './dto/change-status.dto'
import { CreateJobDto } from './dto/create-job.dto'
import { DeliverJobDto } from './dto/deliver-job.dto'
import { JobFiltersBuilder } from './dto/job-filters.dto'
import { JobQueryBuilder, JobQueryDto } from './dto/job-query.dto'
import { JobResponseDto } from './dto/job-response.dto'
import { JobSortBuilder } from './dto/job-sort.dto'
import { UpdateAttachmentsDto } from './dto/update-attachments.dto'
import { UpdateGeneralJobDto } from './dto/update-general.dto'
import { UpdateRevenueDto } from './dto/update-revenue.dto'

@Injectable()
export class JobService {
	private readonly logger = new Logger(JobService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationService: NotificationService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly activityLogService: ActivityLogService
	) {}

	/**
	 * PRIVATE HELPER: Handles data privacy.
	 * Members see personal 'staffCost'. Admins see 'incomeCost' and 'totalStaffCost'.
	 */
	private async mapRoleBasedData(
		rawData: Prisma.JobGetPayload<{
			include: {
				assignments: { include: { user: true } }
			}
		}>[],
		userId: string
	) {
		const userPermissions =
			await this.authService.getEffectivePermissions(userId)

		const canReadSensitiveData = userPermissions.includes(
			APP_PERMISSIONS.JOB.READ_SENSITIVE
		)

		const mapData = rawData.map((job) => {
			const personalCost = job.assignments?.find(
				(a: any) => a.userId === userId || a.user?.id === userId
			)?.staffCost

			return {
				...job,
				totalStaffCost: canReadSensitiveData
					? job.totalStaffCost
					: undefined,
				staffCost: personalCost ?? undefined,
				assignments: job.assignments?.map((asm: any) => ({
					...asm,
					staffCost: canReadSensitiveData ? asm.staffCost : undefined,
					user: asm.user
						? {
								id: asm.user.id,
								displayName: asm.user.displayName,
								username: asm.user.username,
								avatar: asm.user.avatar,
								department: asm.user.department,
							}
						: undefined,
				})),
			}
		})
		return mapData
	}

	// -------------------------------------------------------------------------
	// READ METHODS
	// -------------------------------------------------------------------------

	async findAll(
		userId: string,
		userPermissions: string[],
		query: JobQueryDto
	): Promise<{ data: Job[]; paginate: PaginationMeta }> {
		const {
			tab,
			hideFinishItems,
			page = 1,
			limit = 10,
			search,
			sort = 'createdAt:desc',
			isAll,
			...filters
		} = query

		const filtersQuery = JobFiltersBuilder.build(filters)
		const orderBy = JobSortBuilder.build(sort)
		const tabQuery = JobQueryBuilder.buildQueryTab(tab)
		const searchQuery = JobQueryBuilder.buildSearch(search, [
			'no',
			'displayName',
		])

		const userPermission = await this.buildPermission(userId)
		const queryBuilder: Prisma.JobWhereInput = {
			AND: [userPermission, tabQuery, filtersQuery, searchQuery],
		}

		const [rawData, total] = await Promise.all([
			this.prisma.job.findMany({
				where: queryBuilder,
				orderBy,
				take: isAll ? undefined : Number(limit),
				skip: isAll ? undefined : (Number(page) - 1) * Number(limit),
				include: {
					type: true,
					status: true,
					paymentChannel: true,
					client: {
						select: {
							name: true,
						},
					},
					assignments: { include: { user: true } },
				},
			}),
			this.prisma.job.count({ where: queryBuilder }),
		])

		const mappedData = await this.mapRoleBasedData(rawData, userId)
		return {
			data: plainToInstance(JobResponseDto, mappedData, {
				excludeExtraneousValues: true,
				groups: userPermissions,
			}) as unknown as Job[],
			paginate: {
				limit: Number(limit),
				page: Number(page),
				total,
				totalPages: Math.ceil(total / Number(limit)),
			},
		}
	}

	async getWorkbenchData(
		userId: string,
		userPermissions: string[],
		query: JobQueryDto
	) {
		const pinned = await this.prisma.pinnedJob.findMany({
			where: { userId },
			select: { jobId: true },
		})
		const pinnedIds = pinned.map((p) => p.jobId)

		const result = await this.findAll(userId, userPermissions, query)
		result.data = result.data.map((job) => ({
			...job,
			isPinned: pinnedIds.includes(job.id),
		}))
		return result
	}

	async findByJobNo(
		userId: string,
		userPermissions: string[],
		jobNo: string
	): Promise<Job> {
		const userPermission = await this.buildPermission(userId)

		const job = await this.prisma.job.findFirst({
			where: { AND: [userPermission, { no: jobNo }] },
			include: {
				type: true,
				assignments: {
					include: { user: { include: { department: true } } },
				},
				createdBy: true,
				paymentChannel: true,
				status: true,
				client: {
					select: {
						name: true,
					},
				},
				comments: {
					include: { user: true },
					orderBy: { createdAt: 'desc' },
				},
				activityLog: {
					include: { modifiedBy: true },
					orderBy: { modifiedAt: 'desc' },
				},
			},
		})
		if (!job) throw new NotFoundException('Job not found')
		const mappedData = (await this.mapRoleBasedData([job], userId))[0]

		return plainToInstance(JobResponseDto, mappedData, {
			excludeExtraneousValues: true,
			groups: [
				userPermissions.find(
					(item) => item === APP_PERMISSIONS.JOB.READ_SENSITIVE
				) as string,
			],
		}) as unknown as Job
	}

	async findJobsDueAt(
		userId: string,
		userPermissions: string[],
		isoDate: string
	): Promise<Job[]> {
		const startOfDay = dayjs(isoDate).startOf('day').toDate()
		const endOfDay = dayjs(isoDate).endOf('day').toDate()
		const userPermission = await this.buildPermission(userId)

		const rawData = await this.prisma.job.findMany({
			where: {
				AND: [
					{ dueAt: { gte: startOfDay, lte: endOfDay } },
					{ deletedAt: null },
					userPermission,
				],
			},
			include: {
				status: true,
				type: true,
				assignments: { include: { user: true } },
			},
		})
		const mappedData = await this.mapRoleBasedData(rawData, userId)
		return plainToInstance(JobResponseDto, mappedData, {
			excludeExtraneousValues: true,
			groups: [
				userPermissions.find(
					(item) => item === APP_PERMISSIONS.JOB.READ_SENSITIVE
				) as string,
			],
		}) as unknown as Job[]
	}

	async getDueInMonth(
		month: number,
		year: number,
		userId: string,
		userPermissions: string[]
	): Promise<Job[]> {
		const startOfMonth = dayjs()
			.year(year)
			.month(month - 1)
			.startOf('month')
			.toDate()
		const endOfMonth = dayjs()
			.year(year)
			.month(month - 1)
			.endOf('month')
			.toDate()

		const userPermission = await this.buildPermission(userId)
		const rawData = await this.prisma.job.findMany({
			where: {
				AND: [
					{ dueAt: { gte: startOfMonth, lte: endOfMonth } },
					{ deletedAt: null },
					userPermission,
				],
			},
			include: {
				status: true,
				type: true,
				assignments: { include: { user: true } },
			},
			orderBy: { dueAt: 'asc' },
		})
		const mappedData = await this.mapRoleBasedData(rawData, userId)
		return plainToInstance(JobResponseDto, mappedData, {
			excludeExtraneousValues: true,
			groups: [
				userPermissions.find(
					(item) => item === APP_PERMISSIONS.JOB.READ_SENSITIVE
				) as string,
			],
		}) as unknown as Job[]
	}

	async getPendingDeliverJobs(userId: string, userPermissions: string[]) {
		const userPermission = await this.buildPermission(userId)
		const rawData = await this.prisma.job.findMany({
			where: {
				AND: [
					userPermission,
					{ status: { code: { in: ['in-progress', 'revision'] } } },
					{ deletedAt: null },
				],
			},
			orderBy: { dueAt: 'asc' },
			include: {
				status: true,
				type: true,
				assignments: { include: { user: true } },
			},
		})
		const mappedData = await this.mapRoleBasedData(rawData, userId)
		return plainToInstance(JobResponseDto, mappedData, {
			excludeExtraneousValues: true,
			groups: [
				userPermissions.find(
					(item) => item === APP_PERMISSIONS.JOB.READ_SENSITIVE
				) as string,
			],
		}) as unknown as Job[]
	}

	async getPendingPaymentJobs() {
		const result = await this.prisma.job.findMany({
			where: {
				status: { systemType: 'COMPLETED' },
				isPaid: false,
				deletedAt: null,
			},
			include: {
				status: true,
				type: true,
				paymentChannel: true,
				assignments: { include: { user: true } },
			},
			orderBy: { completedAt: 'asc' },
		})
		const mappedData = result.map((it) => ({
			...it,
			totalStaffCost: it.totalStaffCost,
		}))
		return mappedData
	}

	/**
	 * Admin reviews a staff delivery.
	 * If approved: Job moves to 'completed'.
	 * If rejected: Job moves to 'revision'.
	 */
	async reviewDeliveryActions(
		adminId: string,
		deliveryId: string,
		isApproved: boolean,
		feedback?: string
	) {
		return this.prisma.$transaction(async (tx) => {
			// 1. Update the delivery status
			const delivery = await tx.jobDelivery.update({
				where: { id: deliveryId },
				data: {
					status: isApproved ? 'APPROVED' : 'REJECTED',
					adminFeedback: feedback,
				},
				include: {
					job: { include: { status: true } },
					user: true, // The staff who delivered
				},
			})

			// 2. Determine the next job status based on approval
			const nextStatusCode = isApproved ? 'completed' : 'revision'
			const nextStatus = await tx.jobStatus.findUnique({
				where: { code: nextStatusCode },
			})

			if (!nextStatus) {
				throw new NotFoundException(
					`Status code '${nextStatusCode}' not found in DB`
				)
			}

			// 3. Update the Job
			const jobUpdated = await tx.job.update({
				where: { id: delivery.jobId },
				data: {
					statusId: nextStatus.id,
					completedAt: isApproved ? new Date() : undefined,
				},
				select: {
					no: true,
					displayName: true,
					status: { select: { thumbnailUrl: true } },
				},
			})
			// 4. Log the activity
			await tx.jobActivityLog.create({
				data: {
					jobId: delivery.jobId,
					modifiedById: adminId,
					fieldName: 'Status',
					activityType: isApproved
						? ActivityType.APPROVE
						: ActivityType.REJECT,

					currentValue: nextStatus.displayName,

					// PUBLIC: Anyone can see that the job status changed
					notes: isApproved
						? `Job completed and approved by Admin.`
						: `Job sent back for revision.`,

					// PRIVATE: If rejected, we store the sensitive feedback here.
					// We set a permission so only those who can "APPROVE" can see the specific rejection notes.
					metadata: !isApproved ? { adminFeedback: feedback } : {},
					requiredPermissionCode: APP_PERMISSIONS.JOB.REVIEW,
				},
			})

			// 5. Send real-time notifications
			// Notification for the staff member
			await this.notificationService.send({
				userId: delivery.userId,
				senderId: adminId,
				title: isApproved
					? `[${jobUpdated.no}] Delivery Approved!`
					: `[${jobUpdated.no}] Revision Required`,
				content: isApproved
					? `Your delivery for ${jobUpdated.displayName} was approved.`
					: `Your delivery was rejected. Feedback: ${feedback}`,
				type: isApproved
					? NotificationType.SUCCESS
					: NotificationType.WARNING,
				imageUrl:
					jobUpdated.status.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
				redirectUrl: `/jobs/${jobUpdated.no}`,
			})

			// If approved, notify Accounting to prepare payout
			if (isApproved) {
				const accountants = await tx.user.findMany({
					where: {
						role: {
							permissions: {
								some: {
									entityAction: APP_PERMISSIONS.JOB.PAID,
								},
							},
						},
					},
				})

				if (accountants.length > 0) {
					await this.notificationService.sendMany(
						accountants.map((acc) => ({
							userId: acc.id,
							title: `[${jobUpdated.no}] New Payout Pending`,
							content: `Job #${jobUpdated.no} is completed and ready for payment.`,
							type: NotificationType.JOB_UPDATE,
							imageUrl:
								jobUpdated.status.thumbnailUrl ||
								IMAGES.NOTIFICATION_DEFAULT_IMAGE,
							redirectUrl: `/financial/pending-payouts`,
						}))
					)
				}
			}

			return delivery
		})
	}

	/**
	 * Manually changes a job status.
	 * Handles logic for system types like COMPLETED and TERMINATED.
	 */
	async changeStatus(
		jobId: string,
		modifierId: string,
		data: ChangeStatusDto
	) {
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: { status: true, assignments: true },
		})
		if (!job) throw new NotFoundException('Job not found')

		const targetStatus = await this.prisma.jobStatus.findUnique({
			where: { code: data.newStatus },
		})
		if (!targetStatus)
			throw new NotFoundException('Target status not found')

		const updatedJob = await this.prisma.$transaction(async (tx) => {
			const now = new Date()
			const updateData: Prisma.JobUpdateInput = {
				status: { connect: { id: targetStatus.id } },
			}

			if (targetStatus.systemType === 'COMPLETED')
				updateData.completedAt = now
			if (targetStatus.systemType === 'TERMINATED') {
				updateData.finishedAt = now
				updateData.isPaid = true
				if (!job.paidAt) updateData.paidAt = now
			}

			const result = await tx.job.update({
				where: { id: jobId },
				data: updateData,
			})

			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					fieldName: 'Status',
					activityType: ActivityType.FORCE_CHANGE_STATUS,
					currentValue: targetStatus.displayName,
				},
				tx
			)

			return result
		})

		// Notify staff if status moves from active to another state
		if (
			job.status.systemType !== 'TERMINATED' &&
			job.assignments.length > 0
		) {
			await this.notificationService.sendMany(
				job.assignments.map((a) => ({
					userId: a.userId,
					title: 'Force Status Update',
					content: `Job #${job.no} moved from ${job.status.displayName} to ${targetStatus.displayName}.`,
					type: NotificationType.JOB_UPDATE,
					redirectUrl: `/jobs/${job.no}`,
				}))
			)
		}

		return { id: jobId, no: updatedJob.no }
	}

	// -------------------------------------------------------------------------
	// WRITE / ACTION METHODS
	// -------------------------------------------------------------------------
	async create(createdById: string, data: CreateJobDto): Promise<Job> {
		// 1. Pre-fetch default status outside transaction
		const defaultStatus = await this.prisma.jobStatus.findUnique({
			where: { order: 1 },
		})

		if (!defaultStatus) {
			throw new InternalServerErrorException(
				'Initial status order 1 not found'
			)
		}

		const {
			jobAssignments,
			clientName,
			typeId,
			paymentChannelId,
			incomeCost,
			totalStaffCost,
			attachmentUrls,
			...jobData
		} = data

		// 2. Execute Database Transaction
		const job = await this.prisma.$transaction(async (tx) => {
			// Handle Client Logic (Find or Create)
			let client = await tx.client.findUnique({
				where: { name: clientName },
			})

			if (!client) {
				const newClientCode = await this.generateClientCode(
					clientName,
					tx
				)
				client = await tx.client.create({
					data: { name: clientName, code: newClientCode },
				})
			}

			// Create the Job
			const newJob = await tx.job.create({
				data: {
					...jobData,
					status: { connect: { id: defaultStatus.id } },
					createdBy: { connect: { id: createdById } },
					type: { connect: { id: typeId } },
					paymentChannel: paymentChannelId
						? { connect: { id: paymentChannelId } }
						: undefined,
					incomeCost: parseFloat(incomeCost as any) || 0,
					totalStaffCost: parseFloat(totalStaffCost as any) || 0,
					client: { connect: { id: client.id } },
					attachmentUrls: Array.isArray(attachmentUrls)
						? attachmentUrls
						: [],
					assignments: {
						create:
							jobAssignments?.map((asgn) => ({
								user: { connect: { id: asgn.userId } },
								staffCost:
									parseFloat(asgn.staffCost as any) || 0,
							})) || [],
					},
				},
				include: {
					status: true,
					assignments: {
						include: {
							user: { select: { id: true, displayName: true } },
							job: {
								select: {
									status: { select: { thumbnailUrl: true } },
								},
							},
						},
					},
					client: true,
				},
			})

			// 3. Log the Job Creation using ActivityLogService
			// We log the Job No as the currentValue for the generated note
			await this.activityLogService.create(
				{
					jobId: newJob.id,
					modifiedById: createdById,
					activityType: ActivityType.CREATE_JOB,
					fieldName: 'Job',
					currentValue: newJob.no,
					// Financial details are stored in metadata and masked for regular users
					requiredPermissionCode: 'job.view_financial',
					metadata: {
						incomeCost: newJob.incomeCost,
						clientName: client.name,
						assignmentCount: jobAssignments?.length || 0,
					},
				},
				tx
			)

			return newJob
		})

		// 4. Send Notifications to Assigned Staff (Outside Transaction)
		try {
			if (job.assignments && job.assignments.length > 0) {
				await this.notificationService.sendMany(
					job.assignments.map((asgn) => ({
						userId: asgn.userId,
						senderId: createdById,
						title: `[${job.no}] New Project Assignment`,
						content: `You have been assigned to Job #${job.no}- ${job.displayName}.`,
						type: NotificationType.JOB_ASSIGNED_MEMBER,
						imageUrl:
							asgn.job.status.thumbnailUrl ||
							IMAGES.NOTIFICATION_DEFAULT_IMAGE,
						redirectUrl: `/jobs/${job.no}`,
					}))
				)
			}
		} catch (error) {
			this.logger.error(
				`Notification failed for new job ${job.no}:`,
				error
			)
		}

		return plainToInstance(JobResponseDto, job, {
			excludeExtraneousValues: true,
		}) as unknown as Job
	}

	async updateGeneralInfo(
		modifierId: string,
		jobId: string,
		dto: UpdateGeneralJobDto
	) {
		// 1. Fetch current job state for comparison
		const jobBefore = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				client: true,
				status: { select: { thumbnailUrl: true } },
			},
		})

		if (!jobBefore) throw new NotFoundException('Job not found')

		// 2. Perform Database Operations in Transaction
		const transactionResult = await this.prisma.$transaction(async (tx) => {
			let clientId: string | undefined = undefined

			// --- A. Handle Client Logic (Find or Create) ---
			if (
				dto.clientName &&
				dto.clientName.trim() !== jobBefore.client?.name
			) {
				const existingClient = await tx.client.findFirst({
					where: {
						name: {
							equals: dto.clientName.trim(),
							mode: 'insensitive',
						},
					},
				})

				if (existingClient) {
					clientId = existingClient.id
				} else {
					const newClientCode = await this.generateClientCode(
						dto.clientName,
						tx
					)
					const newClient = await tx.client.create({
						data: {
							name: dto.clientName.trim(),
							code: newClientCode,
						},
					})
					clientId = newClient.id
				}
			}

			// --- B. Execute Job Update ---
			const updatedJob = await tx.job.update({
				where: { id: jobId },
				data: {
					displayName: dto.displayName,
					clientId: clientId,
					startedAt: dto.startedAt,
					dueAt: dto.dueAt,
					description: dto.description,
				},
				include: { client: true },
			})

			// --- C. Detailed Activity Logging ---
			const updateTasks: Promise<any>[] = []

			// Define which fields to track and their specific ActivityType
			const trackableFields = [
				{
					key: 'displayName',
					label: 'Title',
					type: ActivityType.UPDATE_GENERAL_INFORMATION,
				},
				{
					key: 'description',
					label: 'Description',
					type: ActivityType.UPDATE_GENERAL_INFORMATION,
				},
				{
					key: 'startedAt',
					label: 'Start Date',
					type: ActivityType.RESCHEDULE, // Special icon for dates
				},
				{
					key: 'dueAt',
					label: 'Deadline',
					type: ActivityType.RESCHEDULE, // Special icon for dates
				},
			]

			for (const field of trackableFields) {
				const newValue =
					updatedJob[field.key as keyof typeof updatedJob]
				const oldValue = jobBefore[field.key as keyof typeof jobBefore]

				// Compare values safely
				if (newValue?.toString() !== oldValue?.toString()) {
					updateTasks.push(
						this.activityLogService.create(
							{
								jobId,
								modifiedById: modifierId,
								activityType: field.type, // Uses RESCHEDULE for dates
								fieldName: field.label,

								// Custom Note: "Updated Deadline" instead of "Modified dueAt"
								notes: `Updated ${field.label}`,

								currentValue: newValue?.toString() || 'N/A',
								requiredPermissionCode: undefined, // Public info

								// Save raw data for Frontend formatting
								metadata: {
									rawOld: oldValue,
									rawNew: newValue,
									fieldKey: field.key,
								},
							},
							tx
						)
					)
				}
			}

			// Special handling for Client change
			if (clientId && clientId !== jobBefore.clientId) {
				updateTasks.push(
					this.activityLogService.create(
						{
							jobId,
							modifiedById: modifierId,
							activityType:
								ActivityType.UPDATE_CLIENT_INFORMATION, // Specific type
							fieldName: 'Client',
							notes: `Updated Client`,
							currentValue: updatedJob.client?.name || 'N/A',
							requiredPermissionCode: APP_PERMISSIONS.CLIENT.READ,
							metadata: {
								oldClientName: jobBefore.client?.name ?? null,
								newClientName: updatedJob.client?.name,
								oldClientId: jobBefore.clientId,
								newClientId: clientId,
								oldClientCode: jobBefore.client?.code,
								newClientCode: updatedJob.client?.code,
							},
						},
						tx
					)
				)
			}

			await Promise.all(updateTasks)

			return {
				id: updatedJob.id,
				no: updatedJob.no,
				dueAt: updatedJob.dueAt,
			}
		})

		// 3. Notification Logic (Outside Transaction)
		// Check if the deadline actually changed before sending alerts
		if (dto.dueAt && dto.dueAt.toString() !== jobBefore.dueAt.toString()) {
			this.notifyDeadlineChange(
				jobId,
				modifierId,
				transactionResult.no,
				transactionResult.dueAt,
				jobBefore.status.thumbnailUrl ?? undefined
			)
		}

		return { id: transactionResult.id, no: transactionResult.no }
	}

	/**
	 * Updates job attachments (add or remove) with detailed logging.
	 * Matches Frontend: JobAttachmentsField & JobActivityHistory
	 */
	async updateAttachments(
		modifierId: string,
		jobId: string,
		dto: UpdateAttachmentsDto
	) {
		// 1. Fetch current job (include assignments for notifications)
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				status: { select: { thumbnailUrl: true } },
				assignments: { select: { userId: true } },
			},
		})

		if (!job) throw new NotFoundException('Job not found')

		// 2. Calculate New Attachment List
		const currentAttachments = (job.attachmentUrls as string[]) || []
		let finalAttachments: string[] = []
		let logNote = ''

		if (dto.action === 'add') {
			// Logic: Combine arrays -> Set to remove duplicates -> Array
			// This handles both single file adds and bulk uploads from frontend
			finalAttachments = [
				...new Set([...currentAttachments, ...dto.files]),
			]
			logNote = `Added ${dto.files.length} new attachment(s)`
		} else {
			// Logic: Filter out the files present in the DTO
			finalAttachments = currentAttachments.filter(
				(url) => !dto.files.includes(url)
			)
			logNote = `Removed ${dto.files.length} attachment(s)`
		}

		// 3. Execute Transaction (Update DB + Create Log)
		const updatedJob = await this.prisma.$transaction(async (tx) => {
			// A. Update the Job Record
			const result = await tx.job.update({
				where: { id: jobId },
				data: { attachmentUrls: finalAttachments },
				select: { id: true, no: true, displayName: true },
			})

			// B. Create Activity Log
			// We save strict metadata so the Frontend 'JobActivityHistory'
			// can verify 'meta.action' and render the file list 'meta.changedFiles'
			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.UPDATE_ATTACHMENTS,
					fieldName: 'attachmentUrls',
					notes: logNote, // Fallback text: "Added 1 new attachment(s)"
					currentValue: `${finalAttachments.length} files total`,
					requiredPermissionCode: undefined, // Files are generally public to the team
					metadata: {
						action: dto.action, // 'add' or 'remove'
						changedFiles: dto.files, // The specific URLs changed
						totalCount: finalAttachments.length,
					},
				},
				tx
			)

			return result
		})

		// 4. Send Notifications (Only for 'add' action)
		// We do this outside the transaction to prevent external API timeouts holding up the DB
		if (dto.action === 'add' && job.assignments.length > 0) {
			try {
				await this.notificationService.sendMany(
					job.assignments.map((assignee) => ({
						userId: assignee.userId,
						senderId: modifierId,
						title: `[${updatedJob.no}] Files Updated`,
						content: `${dto.files.length} new file(s) have been added to ${updatedJob.displayName}.`,
						type: NotificationType.JOB_UPDATE,
						imageUrl: job.status.thumbnailUrl || undefined,
						// Deep link directly to the 'files' tab if your frontend supports it
						redirectUrl: `/jobs/${updatedJob.no}?tab=files`,
					}))
				)
			} catch (error) {
				this.logger.error(
					`Failed to send attachment notifications for Job ${updatedJob.no}`,
					error
				)
			}
		}

		return {
			id: updatedJob.id,
			no: updatedJob.no,
			attachments: finalAttachments,
		}
	}

	async assignMember(
		modifierId: string,
		jobId: string,
		dto: AssignMemberDto
	) {
		const { memberId, staffCost } = dto

		const existingMember = await this.userService.findById(memberId)
		if (!existingMember) {
			this.logger.error(`Member with ${memberId} not exist!`)
			throw new NotFoundException('Member not exist')
		}
		const jobAssigned = await this.prisma.$transaction(async (tx) => {
			const job = await tx.job.findUnique({
				where: { id: jobId },
				select: { id: true, no: true, displayName: true },
			})
			if (!job) throw new NotFoundException('Job not found')

			try {
				await tx.jobAssignment.create({
					data: { jobId, userId: memberId, staffCost },
				})
			} catch (e) {
				throw new BadRequestException(
					'User is already assigned to this job'
				)
			}

			const aggregate = await tx.jobAssignment.aggregate({
				where: { jobId },
				_sum: { staffCost: true },
			})

			const jobUpdated = await tx.job.update({
				where: { id: jobId },
				data: { totalStaffCost: aggregate._sum.staffCost || 0 },
				include: {
					status: { select: { thumbnailUrl: true } },
					assignments: true,
				},
			})

			await tx.jobActivityLog.create({
				data: {
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.ASSIGN_MEMBER,
					fieldName: 'jobAssignments',
					currentValue: memberId,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_SENSITIVE,
					notes: `[${jobUpdated.no}] Assigned ${existingMember.displayName} to this job`,
					metadata: {
						assignedUser: existingMember.displayName,
						savedCost: staffCost,
					},
				},
			})

			return jobUpdated
		})
		try {
			await this.notificationService.send({
				userId: memberId,
				senderId: modifierId,
				// Hiển thị mã dự án ngay đầu tiêu đề để dễ nhận diện
				title: `[#${jobAssigned.no}] New Job Assignment`,
				content: `You have been assigned to job: ${jobAssigned.no}- ${jobAssigned.displayName}`,
				type: NotificationType.JOB_ASSIGNED_MEMBER,
				imageUrl:
					jobAssigned.status.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
				redirectUrl: `/jobs/${jobAssigned.no}`,
			})
		} catch (error) {
			this.logger.error('Send notification error', error.stack)
		}
		return jobAssigned
	}

	async updateAssignmentCost(
		modifierId: string,
		jobId: string,
		memberId: string,
		dto: UpdateAssignmentDto
	) {
		const { staffCost } = dto

		// 1. Fetch current assignment to get previous cost and job details
		const currentAssignment = await this.prisma.jobAssignment.findUnique({
			where: {
				jobId_userId: { userId: memberId, jobId: jobId },
			},
			include: {
				user: { select: { displayName: true } },
				job: { select: { no: true, displayName: true } },
			},
		})

		if (!currentAssignment)
			throw new NotFoundException('Assignment not found')

		// 2. Database updates in a transaction
		const result = await this.prisma.$transaction(async (tx) => {
			// Update the specific assignment
			const updatedAssignment = await tx.jobAssignment.update({
				where: {
					jobId_userId: { userId: memberId, jobId: jobId },
				},
				data: { staffCost },
			})

			// Recalculate the total sum for the Job
			const aggregate = await tx.jobAssignment.aggregate({
				where: { jobId },
				_sum: { staffCost: true },
			})

			const jobUpdated = await tx.job.update({
				where: { id: jobId },
				data: { totalStaffCost: aggregate._sum.staffCost || 0 },
				include: {
					status: {
						select: {
							thumbnailUrl: true,
						},
					},
				},
			})

			// 3. Log the financial change using ActivityLogService
			// We set requiredPermissionCode to hide the exact values from non-admins/accounting
			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.UPDATE_MEMBER_COST,
					fieldName: currentAssignment.user.displayName,
					currentValue: `${staffCost.toLocaleString()} VND`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_SENSITIVE,
					metadata: {
						targetUser: currentAssignment.user.displayName,
						oldCost: currentAssignment.staffCost,
						newCost: staffCost,
					},
				},
				tx
			)

			return jobUpdated
		})

		// 4. Send notification to the staff member (Outside Transaction)
		try {
			await this.notificationService.send({
				userId: memberId,
				senderId: modifierId,
				title: 'Staff Cost Updated',
				content: `Your cost assignment for Job #${currentAssignment.job.no} has been updated.`,
				type: NotificationType.JOB_UPDATE,
				imageUrl:
					result.status.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
				redirectUrl: `/jobs/${currentAssignment.job.no}`,
			})
		} catch (error) {
			this.logger.error(
				`Notification failed for member ${memberId} on cost update:`,
				error
			)
		}

		return result
	}

	async removeMember(modifierId: string, jobId: string, userId: string) {
		// 1. Fetch assignment and job details first
		const assignment = await this.prisma.jobAssignment.findUnique({
			where: {
				jobId_userId: { jobId, userId },
			},
			include: {
				user: { select: { displayName: true } },
				job: { select: { no: true, displayName: true } },
			},
		})

		if (!assignment) throw new NotFoundException('Assignment not found')

		// 2. Execute database changes in a transaction
		const jobUpdated = await this.prisma.$transaction(async (tx) => {
			// Delete the assignment
			await tx.jobAssignment.delete({
				where: {
					jobId_userId: { jobId, userId },
				},
			})

			// Recalculate the total staff cost for the Job
			const aggregate = await tx.jobAssignment.aggregate({
				where: { jobId },
				_sum: { staffCost: true },
			})

			const jobUpdated = await tx.job.update({
				where: { id: jobId },
				data: {
					totalStaffCost: aggregate._sum.staffCost || 0,
				},
				include: {
					status: { select: { thumbnailUrl: true } },
				},
			})

			// 3. Log the removal using ActivityLogService
			// We log the staff cost in metadata so it remains private (Admin only)
			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.UNASSIGN_MEMBER,
					fieldName: 'jobAssignments',
					currentValue: assignment.user.displayName,
					notes: `[${jobUpdated.no}] Removed ${assignment.user.displayName} from the job`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_SENSITIVE, // Log contains cost-related context
					metadata: {
						removedUser: assignment.user.displayName,
						savedCost: assignment.staffCost,
					},
				},
				tx
			)
			return jobUpdated
		})

		// 4. Send notification OUTSIDE the transaction
		try {
			await this.notificationService.send({
				userId: userId,
				senderId: modifierId,
				title: `[${jobUpdated.no}] Job Assignment Update`,
				content: `You have been removed from job #${assignment.job.no}- ${assignment.job.displayName}.`,
				type: NotificationType.JOB_ASSIGNED_MEMBER,
				imageUrl:
					jobUpdated.status.thumbnailUrl ||
					IMAGES.NOTIFICATION_DEFAULT_IMAGE,
				redirectUrl: `/project-center`,
			})
		} catch (error) {
			this.logger.error(
				`Notification failed for removed user ${userId}:`,
				error
			)
		}

		return { success: true, removedUserId: userId }
	}

	async deliverJob(userId: string, jobId: string, dto: DeliverJobDto) {
		// 1. Fetch current job and status info before transaction
		const reviewStatus = await this.prisma.jobStatus.findFirst({
			where: { systemType: 'DELIVERED' },
		})

		if (!reviewStatus)
			throw new BadRequestException(
				'WAIT_REVIEW status missing in system'
			)

		const jobBefore = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: { status: true },
		})

		if (!jobBefore) throw new NotFoundException('Job not found')

		// 2. Perform Database updates in a transaction
		const result = await this.prisma.$transaction(async (tx) => {
			// Create the delivery record
			const delivery = await tx.jobDelivery.create({
				data: {
					jobId,
					userId,
					link: dto.link,
					note: dto.note,
					files: dto.files, // Assuming dto contains file URLs
					status: 'PENDING',
				},
			})

			// Update Job Status
			const updatedJob = await tx.job.update({
				where: { id: jobId },
				data: { statusId: reviewStatus.id },
				select: {
					no: true,
					displayName: true,
					status: { select: { thumbnailUrl: true } },
				},
			})

			// 3. Log the Activity
			await this.activityLogService.create(
				{
					jobId,
					modifiedById: userId,
					activityType: ActivityType.DELIVER,
					fieldName: 'Status',
					currentValue: reviewStatus.displayName,
					notes: `[${updatedJob.no}] Staff submitted a new delivery for review.`,
					// Store delivery details in metadata for easy admin access
					metadata: {
						deliveryId: delivery.id,
						hasLink: !!dto.link,
						fileCount: dto.files?.length || 0,
						notePreview: dto.note?.substring(0, 50),
					},
					// Public log: Staff can see that they successfully submitted
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_SENSITIVE,
				},
				tx
			)

			return {
				delivery,
				jobNo: updatedJob.no,
				jobName: updatedJob.displayName,
				jobUpdated: updatedJob,
			}
		})

		// 4. Send Notifications OUTSIDE the transaction (Timeout Safety)
		try {
			// Find all users with permission to review jobs (Admins/Managers)
			const approvers = await this.prisma.user.findMany({
				where: {
					role: {
						permissions: {
							some: {
								entityAction: APP_PERMISSIONS.JOB.REVIEW,
							},
						},
					},
					deletedAt: null, // Only active users
				},
			})

			if (approvers.length > 0) {
				await this.notificationService.sendMany(
					approvers.map((admin) => ({
						userId: admin.id,
						senderId: userId,
						// Professional Title: Concise and includes the specific action required
						title: `[${result.jobUpdated.no}] New Delivery Pending Review`,
						// Professional Content: Clear context using Job Number and Name
						content: `A new delivery has been submitted for Job #${result.jobNo}- ${result.jobName}.`,
						type: NotificationType.JOB_DELIVERED,
						imageUrl:
							result.jobUpdated.status.thumbnailUrl ||
							IMAGES.NOTIFICATION_DEFAULT_IMAGE,
						// Maintains the deep link to the specific tab
						redirectUrl: `/admin/mgmt/jobs/${result.jobNo}?tab=deliveries`,
					}))
				)
			}
		} catch (error) {
			this.logger.error(
				`Notification failed for delivery on Job ${result.jobNo}:`,
				error
			)
		}

		return result.delivery
	}

	async getJobDeliveries(jobId: string) {
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
			},
			orderBy: { createdAt: 'desc' }, // Latest delivery first
		})
	}

	async updateRevenue(
		modifierId: string,
		jobId: string,
		dto: UpdateRevenueDto
	) {
		// 1. Initial Validation
		if (!dto.incomeCost && !dto.paymentChannelId) {
			throw new BadRequestException(
				'No financial data provided for update'
			)
		}

		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: { paymentChannel: true },
		})

		if (!job) throw new NotFoundException('Job not found')

		// 2. Perform Database updates in a transaction
		const updatedJob = await this.prisma.$transaction(async (tx) => {
			const updateData: {
				paymentChannelId?: string
				incomeCost?: number
			} = {}

			if (dto.paymentChannelId)
				updateData.paymentChannelId = dto.paymentChannelId
			if (dto.incomeCost)
				updateData.incomeCost = parseFloat(dto.incomeCost.toString())

			const updated = await tx.job.update({
				where: { id: jobId },
				data: updateData,
				include: { paymentChannel: true },
			})

			// 3. Log Financial Activity (Locked behind permission)
			// We log the change but mark it with a permission code so staff can't see the numbers
			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.UPDATE_GENERAL_INFORMATION,
					fieldName: 'Revenue/Payment Channel',
					notes: `${job.incomeCost?.toLocaleString()} VND via ${job.paymentChannel?.displayName || 'N/A'}`,
					currentValue: `${updated.incomeCost?.toLocaleString()} VND via ${updated.paymentChannel?.displayName || 'N/A'}`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_SENSITIVE, // ONLY authorized users see this log detail
					metadata: {
						oldCost: job.incomeCost,
						newCost: updated.incomeCost,
						oldChannel: job.paymentChannel?.displayName,
						newChannel: updated.paymentChannel?.displayName,
					},
				},
				tx
			)

			return updated
		})

		// 4. Notifications (Outside transaction for timeout safety)
		try {
			// Notify the creator or specific accounting roles that revenue was adjusted
			await this.notificationService.send({
				userId: job.createdById, // Notify owner/creator
				senderId: modifierId,
				title: 'Job Revenue Updated',
				content: `Financial details for Job #${job.no} have been updated.`,
				type: NotificationType.JOB_UPDATE,
				redirectUrl: `/jobs/${job.no}`,
			})
		} catch (error) {
			this.logger.error(
				`Notification failed for revenue update on Job ${job.no}:`,
				error
			)
		}

		return { id: updatedJob.id, no: updatedJob.no }
	}

	async markPaid(jobId: string, modifierId: string) {
		// 1. Pre-fetch job to check status and assignments
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				status: true,
				assignments: true,
				client: true,
				jobDeliveries: true,
				paymentChannel: true,
				createdBy: true,
			},
		})

		if (!job || job.isPaid) {
			throw new BadRequestException('Job already paid or not found')
		}

		// 2. Perform Database updates in a transaction
		const updatedJob = await this.prisma.$transaction(async (tx) => {
			const finishStatus = await tx.jobStatus.findFirst({
				where: { systemType: 'TERMINATED' },
			})

			const now = new Date()
			const updateData: Prisma.JobUpdateInput = {
				isPaid: true,
				paidAt: now,
			}

			// Transition status if currently COMPLETED
			if (job.status.systemType === 'COMPLETED') {
				updateData.status = { connect: { id: finishStatus?.id } }
				updateData.finishedAt = now
			}

			const updated = await tx.job.update({
				where: { id: jobId },
				data: updateData,
				select: { id: true, no: true, incomeCost: true },
			})

			// 3. Use ActivityLogService (Passing 'tx')
			// We log the amount in metadata to keep it private from regular staff
			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					fieldName: 'Payment Status',
					activityType: ActivityType.PAID,
					currentValue: now.toISOString(), // For Admin/Accounting view
					requiredPermissionCode: APP_PERMISSIONS.JOB.PAID, // Only users with this code see the amount
					metadata: {
						incomeCost: job.incomeCost,
						totalStaffCost: job.totalStaffCost,
						job: job,
						paidAt: now,
					},
				},
				tx
			)

			return updated
		})

		// 4. Send notifications OUTSIDE the transaction (Timeout Safety)
		try {
			if (job.assignments.length > 0) {
				await this.notificationService.sendMany(
					job.assignments.map((a) => ({
						userId: a.userId,
						title: `[${job.no}] Payment Confirmed`,
						content: `Your work on Job #${job.no} has been paid.`,
						type: NotificationType.JOB_PAID,
						redirectUrl: `/jobs/${job.no}`,
					}))
				)
			}
		} catch (error) {
			this.logger.error(`Notification failed for Job ${job.no}:`, error)
		}

		return { id: updatedJob.id, no: updatedJob.no }
	}

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

	async softDelete(jobId: string, modifierId: string) {
		// 1. Verify job exists and include status/assignments for notification check
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				status: true,
				assignments: true,
			},
		})

		if (!job) throw new NotFoundException('Job not found')
		if (job.deletedAt)
			throw new BadRequestException('Job is already deleted')

		// 2. Execute soft delete and logging in a transaction
		const result = await this.prisma.$transaction(async (tx) => {
			const now = new Date()

			const updated = await tx.job.update({
				where: { id: jobId },
				data: {
					deletedAt: now,
					isPublished: false,
				},
			})

			// 3. Log the deletion activity
			await this.activityLogService.create(
				{
					jobId: job.id,
					modifiedById: modifierId,
					activityType: ActivityType.DELETE,
					fieldName: 'deletedAt',
					currentValue: job.no,
					notes: `Job #${job.no} (${job.displayName}) was soft-deleted.`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.DELETE,
					metadata: {
						deletedAt: now,
						jobNo: job.no,
						jobTitle: job.displayName,
					},
				},
				tx
			)

			return updated
		})

		// 4. Send notifications OUTSIDE the transaction
		// Condition: Only send if the job was NOT already in a TERMINATED system status
		try {
			const isNotTerminated = job.status.systemType !== 'TERMINATED'

			if (isNotTerminated && job.assignments.length > 0) {
				await this.notificationService.sendMany(
					job.assignments.map((assignment) => ({
						userId: assignment.userId,
						senderId: modifierId,
						title: 'Job Cancelled/Deleted',
						content: `Job #${job.no} has been removed from the system.`,
						type: NotificationType.JOB_DELETED,
						redirectUrl: `/project-center`, // Redirect to list since job is now hidden
					}))
				)
			}
		} catch (error) {
			this.logger.error(
				`Failed to send deletion notifications for Job ${job.no}:`,
				error
			)
		}

		return {
			id: result.id,
			no: job.no,
			message: 'Job moved to trash successfully',
		}
	}

	private async buildPermission(
		userId: string
	): Promise<Prisma.JobWhereInput> {
		const userPermissions = await this.userService.userPermissions(userId)
		const canReadAll = userPermissions.includes(
			APP_PERMISSIONS.JOB.READ_ALL
		)

		if (canReadAll) return {}
		return { assignments: { some: { userId } } }
	}

	// Helper: Generate Client Code
	private async generateClientCode(
		name: string,
		tx: Prisma.TransactionClient // Pass transaction context to check existence
	): Promise<string> {
		// 1. Tạo base code từ tên (slugify + uppercase)
		// Ví dụ: "Cadsquad Staff" -> "CADSQUAD-STAFF"
		const baseCode = slugify(name, {
			lower: true,
			strict: true,
		}).toUpperCase()

		// 2. Kiểm tra xem code này đã tồn tại chưa
		const existingClient = await tx.client.findUnique({
			where: { code: baseCode },
			select: { id: true },
		})

		// 3. Nếu chưa tồn tại, return luôn
		if (!existingClient) {
			return baseCode
		}

		// 4. Nếu đã tồn tại, thêm hậu tố (ví dụ: CADSQUAD-STAFF-A1B2)
		const shortId = Math.random().toString(36).substring(2, 6).toUpperCase()
		return `${baseCode}-${shortId}`
	}

	/**
	 * Notifies all assigned members when a job deadline is modified.
	 * @param jobId - The ID of the job
	 * @param modifierId - The ID of the user who changed the deadline
	 * @param jobNo - The human-readable Job Number (e.g., FV-001)
	 * @param newDueDate - The newly assigned Date
	 */
	private async notifyDeadlineChange(
		jobId: string,
		modifierId: string,
		jobNo: string,
		newDueDate: Date,
		thumbnailUrl?: string
	) {
		try {
			// 1. Fetch all members assigned to this job
			const assignments = await this.prisma.jobAssignment.findMany({
				where: { jobId },
				select: { userId: true },
			})

			if (assignments.length === 0) return

			// 2. Format the date for the notification message
			const formattedDate = newDueDate.toLocaleDateString('en-GB', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
			})

			// 3. Dispatch notifications to all assigned staff
			await this.notificationService.sendMany(
				assignments.map((assignee) => ({
					userId: assignee.userId,
					senderId: modifierId,
					title: `[${jobNo}] Schedule Updated`,
					content: `The deadline for Job #${jobNo} has been changed to ${formattedDate}. Please check your schedule.`,
					imageUrl: thumbnailUrl || IMAGES.NOTIFICATION_DEFAULT_IMAGE,
					type: NotificationType.JOB_DEADLINE_REMINDER,
					redirectUrl: `/jobs/${jobNo}`,
				}))
			)

			this.logger.log(
				`Deadline change notifications sent for Job #${jobNo}`
			)
		} catch (error) {
			// We log the error but don't throw it, so the main updateGeneralInfo doesn't fail
			this.logger.error(
				`Failed to send deadline notifications for Job ${jobNo}: ${error.message}`
			)
		}
	}
}
