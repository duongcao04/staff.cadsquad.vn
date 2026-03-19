import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	InternalServerErrorException,
	Logger,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { APP_PERMISSIONS } from '../../utils/_app-permissions'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { JobTypeService } from '../job-type/job-type.service'
import { SharePointService } from '../sharepoint/sharepoint.service'
import { ActivityLogService } from './activity-log.service'
import { AssignMemberDto, UpdateAssignmentDto } from './dto/assign-member.dto'
import { ChangeStatusDto } from './dto/change-status.dto'
import { CreateJobDto } from './dto/create-job.dto'
import { DeliverJobDto } from './dto/deliver-job.dto'
import { CreateJobCommentDto } from './dto/job-comment/create-comment.dto'
import { JobQueryDto } from './dto/job-query.dto'
import { UpdateGeneralJobDto } from './dto/update-general.dto'
import { UpdateRevenueDto } from './dto/update-revenue.dto'
import { JobCommentService } from './job-comment.service'
import { JobService } from './job.service'
import { UpdateAttachmentsDto } from './dto/update-attachments.dto'
import { JobDeliverService } from './job-deliver.service'

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
		private readonly sharepointService: SharePointService
	) { }

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

	@Get()
	@ApiOperation({ summary: 'Get list of jobs with pagination' })
	async findAll(@Req() request: Request, @Query() query: JobQueryDto) {
		const user: TokenPayload = request['user']
		return this.jobService.findAll(user.sub, user.permissions, query)
	}

	@Get('workbench')
	@ApiOperation({ summary: 'Get workbench data (including pins)' })
	async getWorkbenchData(
		@Req() request: Request,
		@Query() query: JobQueryDto
	) {
		const user: TokenPayload = request['user']
		return this.jobService.getWorkbenchData(
			user.sub,
			user.permissions,
			query
		)
	}

	@Get('no/:jobNo')
	@ApiOperation({ summary: 'Get a job by its job number' })
	async findByNo(@Req() request: Request, @Param('jobNo') jobNo: string) {
		const user: TokenPayload = request['user']
		return this.jobService.findByJobNo(user.sub, user.permissions, jobNo)
	}

	@Get('due-at/:isoDate')
	@ApiOperation({ summary: 'Get jobs by deadline date' })
	async findJobsDueAt(
		@Req() request: Request,
		@Param('isoDate') isoDate: string
	) {
		const user: TokenPayload = request['user']
		return this.jobService.findJobsDueAt(
			user.sub,
			user.permissions,
			isoDate
		)
	}

	@Get('due-monthly')
	async getDueInMonth(
		@Query('month') month: string,
		@Query('year') year: string,
		@Req() request: Request
	) {
		const user: TokenPayload = request['user']
		return this.jobService.getDueInMonth(
			Number(month),
			Number(year),
			user.sub,
			user.permissions
		)
	}

	@Get('pending-deliver')
	async getPendingDeliver(@Req() request: Request) {
		const user: TokenPayload = request['user']
		return this.jobService.getPendingDeliverJobs(user.sub, user.permissions)
	}

	@Get('pending-payouts')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.PAID)
	async getPendingPayouts() {
		return this.jobService.getPendingPaymentJobs()
	}

	// -------------------------------------------------------------------------
	// CREATE / ACTION OPERATIONS
	// -------------------------------------------------------------------------

	@Post()
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.CREATE)
	@ResponseMessage('The job has been successfully created.')
	async create(@Req() request: Request, @Body() createJobDto: CreateJobDto) {
		const user: TokenPayload = request['user']
		const created = await this.jobService.create(user.sub, createJobDto)
		return created
	}

	@Post(':id/toggle-pin')
	async togglePin(@Req() request: Request, @Param('id') jobId: string) {
		const user: TokenPayload = request['user']
		return this.jobService.togglePin(user.sub, jobId)
	}

	@Post(':id/deliver')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.DELIVER)
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
		return this.jobService.reviewDeliveryActions(
			user.sub,
			deliveryId,
			action === 'approve',
			data.feedback
		)
	}

	@Post(':id/mark-paid')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.PAID)
	async markPaid(@Req() request: Request, @Param('id') id: string) {
		const user: TokenPayload = request['user']
		return this.jobService.markPaid(id, user.sub)
	}

	// -------------------------------------------------------------------------
	// UPDATE / PATCH OPERATIONS
	// -------------------------------------------------------------------------

	@Patch(':id/general')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.UPDATE)
	@ResponseMessage('Update general information successfully')
	async updateGeneralInfo(
		@Req() request: Request,
		@Param('id') id: string,
		@Body() dto: UpdateGeneralJobDto
	) {
		const user: TokenPayload = request['user']
		return this.jobService.updateGeneralInfo(user.sub, id, dto)
	}

	@Patch(':id/attachments')
	@ApiOperation({ summary: 'Add or remove file attachments from a job' })
	async updateAttachments(
		@Param('id') jobId: string,
		@Body() dto: UpdateAttachmentsDto,
		@Req() request: Request
	) {
		const user: TokenPayload = request['user']
		// req.user.id acts as the modifierId
		return this.jobService.updateAttachments(user.sub, jobId, dto)
	}

	@Patch(':id/assign')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.ASSIGN_MEMBER)
	@ResponseMessage('Member assigned successfully')
	async assignMember(
		@Req() request: Request,
		@Param('id') id: string,
		@Body() dto: AssignMemberDto
	) {
		const user: TokenPayload = request['user']
		return this.jobService.assignMember(user.sub, id, dto)
	}

	@Patch(':id/assignments/:memberId')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.ASSIGN_MEMBER)
	@ResponseMessage('Assignment cost updated')
	async updateAssignment(
		@Req() request: Request,
		@Param('id') jobId: string,
		@Param('memberId') memberId: string,
		@Body() dto: UpdateAssignmentDto
	) {
		const user: TokenPayload = request['user']
		return this.jobService.updateAssignmentCost(
			user.sub,
			jobId,
			memberId,
			dto
		)
	}

	@Delete(':id/assignments/:memberId')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.ASSIGN_MEMBER)
	async unassignMember(
		@Req() request: Request,
		@Param('id') jobId: string,
		@Param('memberId') memberId: string
	) {
		const user: TokenPayload = request['user']
		return this.jobService.removeMember(user.sub, jobId, memberId)
	}

	@Patch(':id/update-revenue')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.UPDATE)
	async updateRevenue(
		@Req() request: Request,
		@Param('id') id: string,
		@Body() updateRevenueDto: UpdateRevenueDto
	) {
		const user: TokenPayload = request['user']
		return this.jobService.updateRevenue(user.sub, id, updateRevenueDto)
	}

	@Patch(':id/change-status')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.JOB.UPDATE)
	async changeStatus(
		@Req() request: Request,
		@Param('id') id: string,
		@Body() data: ChangeStatusDto
	) {
		const user: TokenPayload = request['user']
		return this.jobService.changeStatus(id, user.sub, data)
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
	async remove(@Req() request: Request, @Param('id') id: string) {
		const user: TokenPayload = request['user']
		return this.jobService.softDelete(id, user.sub)
	}
}
