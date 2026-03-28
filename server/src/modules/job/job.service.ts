import { PaginationMeta } from '@/common/interfaces/pagination-meta.interface'
import { ActivityType, Job, Prisma } from '@/generated/prisma'
import { AuthService } from '@/modules/auth/auth.service'
import { UserService } from '@/modules/user/user.service'
import { PrismaService } from '@/providers/prisma/prisma.service'
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { APP_PERMISSIONS } from '@staff-cadsquad/shared'
import { plainToInstance } from 'class-transformer'
import dayjs from 'dayjs'
import slugify from 'slugify'
import { PermissionService } from '../role-permissions/permission.service'
import { ActivityLogService } from './activity-log.service'
import { AssignMemberDto, UpdateAssignmentDto } from './dto/assign-member.dto'
import { ChangeStatusDto } from './dto/change-status.dto'
import { CreateJobDto } from './dto/create-job.dto'
import { JobFiltersBuilder } from './dto/job-filters.dto'
import { JobQueryBuilder, JobQueryDto } from './dto/job-query.dto'
import { JobResponseDto } from './dto/job-response.dto'
import { JobSortBuilder } from './dto/job-sort.dto'
import { UpdateAttachmentsDto } from './dto/update-attachments.dto'
import { UpdateGeneralJobDto } from './dto/update-general.dto'
import { UpdateRevenueDto } from './dto/update-revenue.dto'
import { JobActionEvent } from './events/job-action.event'

@Injectable()
export class JobService {
	private readonly logger = new Logger(JobService.name)

	constructor(
		private readonly prisma: PrismaService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly activityLogService: ActivityLogService,
		private readonly permissionService: PermissionService,
		private readonly eventEmitter: EventEmitter2
	) { }

	/**
	 * PRIVATE HELPER: Handles data privacy.
	 */
	private async mapRoleBasedData(
		rawData: Prisma.JobGetPayload<{
			include: { assignments: { include: { user: true } } }
		}>[],
		userId: string
	) {
		const userPermissions =
			await this.authService.getEffectivePermissions(userId)
		const canReadStaffCost = userPermissions.includes(
			APP_PERMISSIONS.JOB.READ_STAFF_COST
		)

		return rawData.map((job) => {
			const personalCost = job.assignments?.find(
				(a: any) => a.userId === userId || a.user?.id === userId
			)?.staffCost

			return {
				...job,
				totalStaffCost: canReadStaffCost
					? job.totalStaffCost
					: undefined,
				staffCost: personalCost ?? undefined,
				assignments: job.assignments?.map((asm: any) => ({
					...asm,
					staffCost: canReadStaffCost ? asm.staffCost : undefined,
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
					client: { select: { name: true } },
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
				createdBy: true,
				paymentChannel: true,
				status: true,
				client: { select: { name: true } },
				assignments: {
					include: { user: { include: { department: true } } },
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
			groups: userPermissions,
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
			groups: userPermissions,
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
			groups: userPermissions,
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
			groups: userPermissions,
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
		return result.map((it) => ({
			...it,
			totalStaffCost: it.totalStaffCost,
		}))
	}

	// -------------------------------------------------------------------------
	// WRITE / ACTION METHODS
	// -------------------------------------------------------------------------
	async create(createdById: string, data: CreateJobDto): Promise<Job> {
		const defaultStatus = await this.prisma.jobStatus.findUnique({
			where: { order: 1 },
		})
		if (!defaultStatus)
			throw new InternalServerErrorException(
				'Initial status order 1 not found'
			)

		const {
			jobAssignments,
			clientName,
			typeId,
			paymentChannelId,
			incomeCost,
			totalStaffCost,
			attachmentUrls,
			sharepointFolderId,
			...jobData
		} = data

		const newJob = await this.prisma.$transaction(async (tx) => {
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

			const createdJob = await tx.job.create({
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
					sharepointFolderId: sharepointFolderId || undefined,
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
					client: true,
					assignments: {
						include: {
							user: {
								select: {
									id: true,
									displayName: true,
									email: true,
									personalEmail: true,
								},
							},
						},
					},
				},
			})

			await this.activityLogService.create(
				{
					jobId: createdJob.id,
					modifiedById: createdById,
					activityType: ActivityType.CREATE_JOB,
					fieldName: 'Job',
					currentValue: createdJob.no,
					requiredPermissionCode: 'job.view_financial',
					metadata: {
						incomeCost: createdJob.incomeCost,
						clientName: client.name,
						assignmentCount: jobAssignments?.length || 0,
					},
				},
				tx
			)

			return createdJob
		})

		// Fire Event for Notifications & Emails
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.CREATE_JOB,
				newJob.id,
				createdById,
				{},
				newJob
			)
		)

		return plainToInstance(JobResponseDto, newJob, {
			excludeExtraneousValues: true,
		}) as unknown as Job
	}

	async updateGeneralInfo(
		modifierId: string,
		jobId: string,
		dto: UpdateGeneralJobDto
	) {
		const jobBefore = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				client: true,
				status: true,
				assignments: { include: { user: true } },
			},
		})
		if (!jobBefore) throw new NotFoundException('Job not found')

		const transactionResult = await this.prisma.$transaction(async (tx) => {
			let clientId: string | undefined = undefined

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

			const updatedJob = await tx.job.update({
				where: { id: jobId },
				data: {
					displayName: dto.displayName,
					clientId: clientId,
					startedAt: dto.startedAt,
					dueAt: dto.dueAt,
					description: dto.description,
				},
				include: {
					client: true,
					status: true,
					assignments: { include: { user: true } },
				},
			})

			const updateTasks: Promise<any>[] = []
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
					type: ActivityType.RESCHEDULE,
				},
				{
					key: 'dueAt',
					label: 'Deadline',
					type: ActivityType.RESCHEDULE,
				},
			]

			for (const field of trackableFields) {
				const newValue =
					updatedJob[field.key as keyof typeof updatedJob]
				const oldValue = jobBefore[field.key as keyof typeof jobBefore]

				if (newValue?.toString() !== oldValue?.toString()) {
					updateTasks.push(
						this.activityLogService.create(
							{
								jobId,
								modifiedById: modifierId,
								activityType: field.type,
								fieldName: field.label,
								notes: `Updated ${field.label}`,
								currentValue: newValue?.toString() || 'N/A',
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

			if (clientId && clientId !== jobBefore.clientId) {
				updateTasks.push(
					this.activityLogService.create(
						{
							jobId,
							modifiedById: modifierId,
							activityType:
								ActivityType.UPDATE_CLIENT_INFORMATION,
							fieldName: 'Client',
							notes: `Updated Client`,
							currentValue: updatedJob.client?.name || 'N/A',
							requiredPermissionCode: APP_PERMISSIONS.CLIENT.READ,
							metadata: {
								oldClientName: jobBefore.client?.name,
								newClientName: updatedJob.client?.name,
							},
						},
						tx
					)
				)
			}

			await Promise.all(updateTasks)
			return updatedJob
		})

		// Fire Events if Rescheduled
		if (dto.dueAt && dto.dueAt.toString() !== jobBefore.dueAt.toString()) {
			this.eventEmitter.emit(
				'job.action',
				new JobActionEvent(
					ActivityType.RESCHEDULE,
					jobId,
					modifierId,
					{ newDueAt: dto.dueAt },
					transactionResult
				)
			)
		}

		return { id: transactionResult.id, no: transactionResult.no }
	}

	async updateAttachments(
		modifierId: string,
		jobId: string,
		dto: UpdateAttachmentsDto
	) {
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: { status: true, assignments: { include: { user: true } } },
		})
		if (!job) throw new NotFoundException('Job not found')

		const currentAttachments = (job.attachmentUrls as string[]) || []
		let finalAttachments: string[] = []
		let logNote = ''

		if (dto.action === 'add') {
			finalAttachments = [
				...new Set([...currentAttachments, ...dto.files]),
			]
			logNote = `Added ${dto.files.length} new attachment(s)`
		} else {
			finalAttachments = currentAttachments.filter(
				(url) => !dto.files.includes(url)
			)
			logNote = `Removed ${dto.files.length} attachment(s)`
		}

		const updatedJob = await this.prisma.$transaction(async (tx) => {
			const result = await tx.job.update({
				where: { id: jobId },
				data: { attachmentUrls: finalAttachments },
				select: { id: true, no: true, displayName: true },
			})

			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.UPDATE_ATTACHMENTS,
					fieldName: 'attachmentUrls',
					notes: logNote,
					currentValue: `${finalAttachments.length} files total`,
					metadata: {
						action: dto.action,
						changedFiles: dto.files,
						totalCount: finalAttachments.length,
					},
				},
				tx
			)

			return result
		})

		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.UPDATE_ATTACHMENTS,
				jobId,
				modifierId,
				{ action: dto.action, filesCount: dto.files.length },
				job
			)
		)

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
		if (!existingMember) throw new NotFoundException('Member not exist')

		const jobUpdated = await this.prisma.$transaction(async (tx) => {
			const job = await tx.job.findUnique({ where: { id: jobId } })
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

			const updated = await tx.job.update({
				where: { id: jobId },
				data: { totalStaffCost: aggregate._sum.staffCost || 0 },
				include: {
					status: true,
					assignments: { include: { user: true } },
					client: true,
				},
			})

			await tx.jobActivityLog.create({
				data: {
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.ASSIGN_MEMBER,
					fieldName: 'jobAssignments',
					currentValue: memberId,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_INCOME,
					notes: `[${updated.no}] Assigned ${existingMember.displayName} to this job`,
					metadata: {
						assignedUser: existingMember.displayName,
						savedCost: staffCost,
					},
				},
			})

			return updated
		})

		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.ASSIGN_MEMBER,
				jobId,
				modifierId,
				{
					memberId,
					userEmail: existingMember.email,
					userPersonalEmail: existingMember.personalEmail,
					userDisplayName: existingMember.displayName,
				},
				jobUpdated
			)
		)

		return jobUpdated
	}

	async updateAssignmentCost(
		modifierId: string,
		jobId: string,
		memberId: string,
		dto: UpdateAssignmentDto
	) {
		const { staffCost } = dto

		const currentAssignment = await this.prisma.jobAssignment.findUnique({
			where: { jobId_userId: { userId: memberId, jobId: jobId } },
			include: {
				user: { select: { displayName: true } },
				job: { select: { no: true, displayName: true } },
			},
		})
		if (!currentAssignment)
			throw new NotFoundException('Assignment not found')

		const jobUpdated = await this.prisma.$transaction(async (tx) => {
			await tx.jobAssignment.update({
				where: { jobId_userId: { userId: memberId, jobId: jobId } },
				data: { staffCost },
			})
			const aggregate = await tx.jobAssignment.aggregate({
				where: { jobId },
				_sum: { staffCost: true },
			})

			const updated = await tx.job.update({
				where: { id: jobId },
				data: { totalStaffCost: aggregate._sum.staffCost || 0 },
				include: { status: true },
			})

			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.UPDATE_MEMBER_COST,
					fieldName: currentAssignment.user.displayName,
					currentValue: `${staffCost.toLocaleString()} VND`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_STAFF_COST,
					metadata: {
						targetUser: currentAssignment.user.displayName,
						oldCost: currentAssignment.staffCost,
						newCost: staffCost,
					},
				},
				tx
			)

			return updated
		})

		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.UPDATE_MEMBER_COST,
				jobId,
				modifierId,
				{ memberId },
				jobUpdated
			)
		)

		return jobUpdated
	}

	async removeMember(modifierId: string, jobId: string, userId: string) {
		const assignment = await this.prisma.jobAssignment.findUnique({
			where: { jobId_userId: { jobId, userId } },
			include: {
				user: { select: { displayName: true } },
				job: { select: { no: true, displayName: true } },
			},
		})
		if (!assignment) throw new NotFoundException('Assignment not found')

		const jobUpdated = await this.prisma.$transaction(async (tx) => {
			await tx.jobAssignment.delete({
				where: { jobId_userId: { jobId, userId } },
			})
			const aggregate = await tx.jobAssignment.aggregate({
				where: { jobId },
				_sum: { staffCost: true },
			})

			const updated = await tx.job.update({
				where: { id: jobId },
				data: { totalStaffCost: aggregate._sum.staffCost || 0 },
				include: { status: true },
			})

			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.UNASSIGN_MEMBER,
					fieldName: 'jobAssignments',
					currentValue: assignment.user.displayName,
					notes: `[${updated.no}] Removed ${assignment.user.displayName} from the job`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_STAFF_COST,
					metadata: {
						removedUser: assignment.user.displayName,
						savedCost: assignment.staffCost,
					},
				},
				tx
			)

			return updated
		})

		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.UNASSIGN_MEMBER,
				jobId,
				modifierId,
				{ memberId: userId },
				jobUpdated
			)
		)

		return { success: true, removedUserId: userId }
	}

	async updateRevenue(
		modifierId: string,
		jobId: string,
		dto: UpdateRevenueDto
	) {
		if (!dto.incomeCost && !dto.paymentChannelId)
			throw new BadRequestException(
				'No financial data provided for update'
			)

		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: { paymentChannel: true },
		})
		if (!job) throw new NotFoundException('Job not found')

		const updatedJob = await this.prisma.$transaction(async (tx) => {
			const updateData: any = {}
			if (dto.paymentChannelId)
				updateData.paymentChannelId = dto.paymentChannelId
			if (dto.incomeCost)
				updateData.incomeCost = parseFloat(dto.incomeCost.toString())

			const updated = await tx.job.update({
				where: { id: jobId },
				data: updateData,
				include: { paymentChannel: true },
			})

			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.UPDATE_GENERAL_INFORMATION,
					fieldName: 'Revenue/Payment Channel',
					notes: `${job.incomeCost?.toLocaleString()} VND via ${job.paymentChannel?.displayName || 'N/A'}`,
					currentValue: `${updated.incomeCost?.toLocaleString()} VND via ${updated.paymentChannel?.displayName || 'N/A'}`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_STAFF_COST,
					metadata: {
						oldCost: job.incomeCost,
						newCost: updated.incomeCost,
					},
				},
				tx
			)

			return updated
		})

		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.UPDATE_GENERAL_INFORMATION,
				jobId,
				modifierId,
				{ isRevenueUpdate: true },
				updatedJob
			)
		)

		return { id: updatedJob.id, no: updatedJob.no }
	}

	async markPaid(jobId: string, modifierId: string) {
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				status: true,
				assignments: { include: { user: true } },
				client: true,
				paymentChannel: true,
			},
		})

		if (!job || job.isPaid)
			throw new BadRequestException('Job already paid or not found')

		const updatedJob = await this.prisma.$transaction(async (tx) => {
			const finishStatus = await tx.jobStatus.findFirst({
				where: { systemType: 'TERMINATED' },
			})
			const now = new Date()
			const updateData: Prisma.JobUpdateInput = {
				isPaid: true,
				paidAt: now,
			}

			if (job.status.systemType === 'COMPLETED') {
				updateData.status = { connect: { id: finishStatus?.id } }
				updateData.finishedAt = now
			}

			const updated = await tx.job.update({
				where: { id: jobId },
				data: updateData,
				include: { assignments: { include: { user: true } } },
			})

			await this.activityLogService.create(
				{
					jobId,
					modifiedById: modifierId,
					fieldName: 'Payment Status',
					activityType: ActivityType.PAID,
					currentValue: now.toISOString(),
					requiredPermissionCode: APP_PERMISSIONS.JOB.PAID,
					metadata: {
						incomeCost: job.incomeCost,
						totalStaffCost: job.totalStaffCost,
						paidAt: now,
					},
				},
				tx
			)

			return updated
		})

		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.PAID,
				jobId,
				modifierId,
				{},
				updatedJob
			)
		)
		return { id: updatedJob.id, no: updatedJob.no }
	}

	async reviewDeliveryActions(
		adminId: string,
		deliveryId: string,
		isApproved: boolean,
		feedback?: string
	) {
		const { delivery, jobUpdated } = await this.prisma.$transaction(
			async (tx) => {
				const delivery = await tx.jobDelivery.update({
					where: { id: deliveryId },
					data: {
						status: isApproved ? 'APPROVED' : 'REJECTED',
						adminFeedback: feedback,
					},
				})

				const nextStatusCode = isApproved ? 'completed' : 'revision'
				const nextStatus = await tx.jobStatus.findUnique({
					where: { code: nextStatusCode },
				})
				if (!nextStatus)
					throw new NotFoundException(
						`Status code '${nextStatusCode}' not found in DB`
					)

				const jobUpdated = await tx.job.update({
					where: { id: delivery.jobId },
					data: {
						statusId: nextStatus.id,
						completedAt: isApproved ? new Date() : undefined,
					},
					include: {
						status: true,
						assignments: { include: { user: true } },
					},
				})

				await tx.jobActivityLog.create({
					data: {
						jobId: delivery.jobId,
						modifiedById: adminId,
						fieldName: 'Status',
						activityType: isApproved
							? ActivityType.APPROVE
							: ActivityType.REJECT,
						currentValue: nextStatus.displayName,
						notes: isApproved
							? `Job approved.`
							: `Sent back for revision.`,
						metadata: !isApproved
							? { adminFeedback: feedback }
							: {},
						requiredPermissionCode: APP_PERMISSIONS.JOB.REVIEW,
					},
				})

				return { delivery, jobUpdated }
			}
		)

		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				isApproved ? ActivityType.APPROVE : ActivityType.REJECT,
				delivery.jobId,
				adminId,
				{ feedback },
				jobUpdated
			)
		)

		return delivery
	}

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
				include: {
					status: true,
					assignments: { include: { user: true } },
				},
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

		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.FORCE_CHANGE_STATUS,
				jobId,
				modifierId,
				{ oldStatusName: job.status.displayName },
				updatedJob
			)
		)

		return { id: jobId, no: updatedJob.no }
	}

	async softDelete(jobId: string, modifierId: string) {
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: { status: true, assignments: true },
		})

		if (!job) throw new NotFoundException('Job not found')
		if (job.deletedAt)
			throw new BadRequestException('Job is already deleted')

		const result = await this.prisma.$transaction(async (tx) => {
			const now = new Date()
			const updated = await tx.job.update({
				where: { id: jobId },
				data: { deletedAt: now, isPublished: false },
				include: { status: true, assignments: true },
			})

			await this.activityLogService.create(
				{
					jobId: job.id,
					modifiedById: modifierId,
					activityType: ActivityType.DELETE,
					fieldName: 'deletedAt',
					currentValue: job.no,
					notes: `Job #${job.no} (${job.displayName}) was soft-deleted.`,
					requiredPermissionCode: APP_PERMISSIONS.JOB.DELETE,
				},
				tx
			)

			return updated
		})

		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.DELETE,
				jobId,
				modifierId,
				{},
				result
			)
		)

		return {
			id: result.id,
			no: job.no,
			message: 'Job moved to trash successfully',
		}
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

	private async generateClientCode(
		name: string,
		tx: Prisma.TransactionClient
	): Promise<string> {
		const baseCode = slugify(name, {
			lower: true,
			strict: true,
		}).toUpperCase()
		const existingClient = await tx.client.findUnique({
			where: { code: baseCode },
			select: { id: true },
		})
		if (!existingClient) return baseCode
		const shortId = Math.random().toString(36).substring(2, 6).toUpperCase()
		return `${baseCode}-${shortId}`
	}
}
