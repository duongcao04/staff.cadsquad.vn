import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { APP_PERMISSIONS } from '@/utils'
import { AuditLog } from '../../common/decorators/audit-log.decorator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { SystemModule } from '../../generated/prisma'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { JobTypeService } from '../job-type/job-type.service'
import { SharePointService } from '../sharepoint/sharepoint.service'
import { ActivityLogService } from './activity-log.service'
import { AssignMemberCommand } from './commands/impl/assign-member.command'
import { ConfirmPaymentCommand } from './commands/impl/confirm-payment.command'
import { CreateJobCommand } from './commands/impl/create-job.command'
import { ReviewDeliveryCommand } from './commands/impl/review-delivery.command'
import { UpdateJobCommand } from './commands/impl/update-job.command'
import { AssignMemberDto, UpdateAssignmentDto } from './dto/assign-member.dto'
import { ChangeStatusDto } from './dto/change-status.dto'
import { CreateJobDto } from './dto/create-job.dto'
import { DeliverJobDto } from './dto/deliver-job.dto'
import { CreateJobCommentDto } from './dto/job-comment/create-comment.dto'
import { JobQueryDto } from './dto/job-query.dto'
import { UpdateAttachmentsDto } from './dto/update-attachments.dto'
import { UpdateGeneralJobDto } from './dto/update-general.dto'
import { UpdateRevenueDto } from './dto/update-revenue.dto'
import { JobCommentService } from './job-comment.service'
import { JobDeliverService } from './job-deliver.service'
import { JobService } from './job.service'
import { FindJobsPendingPayoutsQuery } from './queries/impl/find-jobs-pending-payouts'
import { FindJobsToDeliverQuery } from './queries/impl/find-jobs-to-deliver'
import { FindJobsByDeadlineQuery } from './queries/impl/find-jobs-by-deadline.query'
import { FindJobByNoQuery } from './queries/impl/find-job-by-no.query'
import { FindAllJobsQuery } from './queries/impl/find-all-jobs.query'
import { SoftDeleteJobCommand } from './commands/impl/soft-delete-job.command'
import { ForceChangeStatusCommand } from './commands/impl/force-change-status.command'
import { UpdateFinancialDetailsCommand } from './commands/impl/update-financial-details.command'
import { RemoveMemberCommand } from './commands/impl/remove-member.command'
import { UpdateAssignmentCostCommand } from './commands/impl/update-assignment-cost.command'
import { RestoreJobCommand } from './commands/impl/restore-job.command'
import {
	GetPayoutDetailsHandler,
	GetPayoutDetailsQuery,
} from './queries/impl/get-payout-details'
import { GetJobFinancialDetailsQuery } from './queries/impl/get-job-financial-details.query'

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class JobController {
	private readonly logger = new Logger(JobController.name)
	constructor(
		private readonly jobService: JobService,
		private readonly jobDeliverService: JobDeliverService,
		private readonly jobTypeService: JobTypeService,
		private readonly activityLogService: ActivityLogService,
		private readonly commentService: JobCommentService,
		private readonly sharepointService: SharePointService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	// -------------------------------------------------------------------------
	// READ OPERATIONS
	// -------------------------------------------------------------------------

	@Get(':id/deliveries')
	@ResponseMessage('Get job deliveries successfully')
	@ApiOperation({ summary: 'Get all delivery attempts for a specific job' })
	async getJobDeliveries(@Param('id') id: string) {
		return this.jobDeliverService.getDeliveriesByJob(id)
	}

	@Get(':jobId/activity-logs')
	@ResponseMessage('Fetch activity logs successfully')
	async getActivityLogs(
		@Param('jobId') jobId: string,
		@Req() request: Request
	) {
		const user: TokenPayload = request['user']
		const logs = await this.activityLogService.findByJobId(
			jobId,
			user.role.code,
			user.permissions
		)
		return logs
	}

	@Get(':jobId/comments')
	@ResponseMessage('Fetch job comments successfully')
	async findAllComments(@Param('jobId') jobId: string) {
		const comments = await this.commentService.findAllByJob(jobId)
		return comments
	}

	@Post(':jobId/comments')
	@ResponseMessage('Đã đăng bình luận')
	async createComment(
		@Param('jobId') jobId: string,
		@Body() dto: CreateJobCommentDto,
		@Req() request: Request
	) {
		const user: TokenPayload = request['user']
		const comment = await this.commentService.createComment(
			jobId,
			user.sub,
			dto
		)
		return comment
	}

	@Get(':id/financials')
	@ApiOperation({ summary: 'Get job financial details' })
	async getJobFinancials(@Param('id') id: string) {
		return this.queryBus.execute(new GetJobFinancialDetailsQuery(id))
	}

	@Get()
	@ApiOperation({ summary: 'Get list of jobs with pagination' })
	async findAll(@Req() request: Request, @Query() query: JobQueryDto) {
		const user: TokenPayload = request['user']
		return this.queryBus.execute(
			new FindAllJobsQuery(user.sub, user.permissions, query)
		)
	}

	@Get('workbench')
	@ApiOperation({ summary: 'Get workbench data (including pins)' })
	async getWorkbenchData(
		@Req() request: Request,
		@Query() query: JobQueryDto
	) {
		const user: TokenPayload = request['user']
		return this.queryBus.execute(
			new FindAllJobsQuery(user.sub, user.permissions, query)
		)
	}

	@Get('no/:jobNo')
	@ApiOperation({ summary: 'Get a job by its job number' })
	async findByNo(@Req() request: Request, @Param('jobNo') jobNo: string) {
		const user: TokenPayload = request['user']
		return this.queryBus.execute(
			new FindJobByNoQuery(user.sub, user.permissions, jobNo)
		)
	}

	@Get('due-at/:isoDate')
	@ApiOperation({ summary: 'Get jobs by deadline date' })
	async findJobsDueAt(
		@Req() request: Request,
		@Param('isoDate') isoDate: string
	) {
		const user: TokenPayload = request['user']
		return this.queryBus.execute(
			new FindJobsByDeadlineQuery(user.sub, user.permissions, isoDate)
		)
	}

	@Get('pending-deliver')
	async getPendingDeliver(@Req() request: Request) {
		const user: TokenPayload = request['user']
		return this.queryBus.execute(
			new FindJobsToDeliverQuery(user.sub, user.permissions)
		)
	}

	@Get('pending-payouts')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.PAID)
	async getPendingPayouts() {
		return this.queryBus.execute(new FindJobsPendingPayoutsQuery())
	}

	@Get('payouts/:no')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.PAID)
	async getPayoutDetails(
		@Req() request: Request,
		@Param('no') jobNo: string
	) {
		const user: TokenPayload = request['user']
		return this.queryBus.execute(
			new GetPayoutDetailsQuery(user.sub, user.permissions, jobNo)
		)
	}

	// -------------------------------------------------------------------------
	// CREATE / ACTION OPERATIONS
	// -------------------------------------------------------------------------

	@Post()
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.CREATE)
	@ResponseMessage('The job has been successfully created.')
	@AuditLog('Create new job', SystemModule.JOB)
	async createJob(
		@Req() request: Request,
		@Body() createJobDto: CreateJobDto
	) {
		const user: TokenPayload = request['user']
		return this.commandBus.execute(
			new CreateJobCommand(user.sub, createJobDto)
		)
	}

	@Post(':id/toggle-pin')
	async togglePin(@Req() request: Request, @Param('id') jobId: string) {
		const user: TokenPayload = request['user']
		return this.jobService.togglePin(user.sub, jobId)
	}

	@Post(':id/deliver')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.DELIVER)
	@AuditLog('Delivered job', SystemModule.DELIVERY)
	async deliverJob(
		@Req() request: Request,
		@Param('id') id: string,
		@Body() data: DeliverJobDto
	) {
		const user: TokenPayload = request['user']
		return this.jobDeliverService.deliverJob(user.sub, id, data)
	}

	@Post('deliver/:deliveryId/:action')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.REVIEW)
	async reviewDeliver(
		@Req() request: Request,
		@Param('deliveryId') deliveryId: string,
		@Param('action') action: string,
		@Body() data: { feedback?: string }
	) {
		const user: TokenPayload = request['user']
		if (action !== 'approve' && action !== 'reject') {
			throw new BadRequestException('Action must be approve or reject')
		}
		return this.commandBus.execute(
			new ReviewDeliveryCommand(
				user.sub,
				deliveryId,
				action === 'approve',
				data.feedback
			)
		)
	}

	@Post(':id/mark-paid')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.PAID)
	@AuditLog('Paid for job', SystemModule.FINANCIAL)
	async confirmPayment(@Req() request: Request, @Param('id') jobId: string) {
		const user: TokenPayload = request['user']
		return this.commandBus.execute(
			new ConfirmPaymentCommand(jobId, user.sub)
		)
	}

	// -------------------------------------------------------------------------
	// UPDATE / PATCH OPERATIONS
	// -------------------------------------------------------------------------
	@Patch(':id/general')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.UPDATE)
	@ResponseMessage('Update job successfully')
	async updateJob(
		@Req() request: Request,
		@Param('id') jobId: string,
		@Body()
		dto: UpdateGeneralJobDto & { attachments?: UpdateAttachmentsDto }
	) {
		const user: TokenPayload = request['user']
		return this.commandBus.execute(
			new UpdateJobCommand(user.sub, jobId, dto)
		)
	}

	@Patch(':id/assign')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.ASSIGNMENT)
	@ResponseMessage('Member assigned successfully')
	@AuditLog('Assign new member for job', SystemModule.JOB)
	async assignMember(
		@Req() request: Request,
		@Param('id') id: string,
		@Body() dto: AssignMemberDto
	) {
		const user: TokenPayload = request['user']
		return this.commandBus.execute(
			new AssignMemberCommand(user.sub, id, dto)
		)
	}

	@Patch(':id/assignments/:memberId')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.ASSIGNMENT)
	@ResponseMessage('Assignment cost updated')
	async updateAssignment(
		@Req() request: Request,
		@Param('id') jobId: string,
		@Param('memberId') memberId: string,
		@Body() dto: UpdateAssignmentDto
	) {
		const user: TokenPayload = request['user']
		return this.commandBus.execute(
			new UpdateAssignmentCostCommand(user.sub, jobId, memberId, dto)
		)
	}

	@Delete(':id/assignments/:memberId')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.ASSIGNMENT)
	@AuditLog('Remove assignment member from job', SystemModule.JOB)
	async unassignMember(
		@Req() request: Request,
		@Param('id') jobId: string,
		@Param('memberId') memberId: string
	) {
		const user: TokenPayload = request['user']
		return this.commandBus.execute(
			new RemoveMemberCommand(user.sub, jobId, memberId)
		)
	}

	@Patch(':id/update-revenue')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.UPDATE)
	@AuditLog('Update revenue', SystemModule.FINANCIAL)
	async updateRevenue(
		@Req() request: Request,
		@Param('id') id: string,
		@Body() updateRevenueDto: UpdateRevenueDto
	) {
		const user: TokenPayload = request['user']
		return this.commandBus.execute(
			new UpdateFinancialDetailsCommand(user.sub, id, updateRevenueDto)
		)
	}

	@Patch(':id/change-status')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.UPDATE)
	@AuditLog('Force update job status', SystemModule.JOB)
	async changeStatus(
		@Req() request: Request,
		@Param('id') id: string,
		@Body() data: ChangeStatusDto
	) {
		const user: TokenPayload = request['user']
		const updated = this.commandBus.execute(
			new ForceChangeStatusCommand(id, user.sub, data)
		)
		return updated
	}

	// -------------------------------------------------------------------------
	// ADMIN UTILS
	// -------------------------------------------------------------------------

	@Get('next-no')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.READ_ALL)
	async getNextNo(@Query('typeId') typeId: string) {
		return this.jobTypeService.getNextJobNo(typeId)
	}

	@Delete(':id')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.DELETE)
	@AuditLog('Cancelled job', SystemModule.JOB)
	async remove(@Req() request: Request, @Param('id') id: string) {
		const user: TokenPayload = request['user']
		request['auditTargetId'] = id
		const jobDetails = await this.jobService.findOne(id)
		request['auditTargetDisplay'] =
			`${jobDetails?.no}- ${jobDetails?.displayName}`
		return this.commandBus.execute(new SoftDeleteJobCommand(id, user.sub))
	}

	@Patch(':id/restore')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.DELETE)
	@AuditLog('Restored job', SystemModule.JOB)
	async restore(@Req() request: Request, @Param('id') id: string) {
		const user: TokenPayload = request['user']
		request['auditTargetId'] = id
		const jobDetails = await this.jobService.findOne(id)
		request['auditTargetDisplay'] =
			`${jobDetails?.no}- ${jobDetails?.displayName}`
		return this.commandBus.execute(new RestoreJobCommand(id, user.sub))
	}
}
