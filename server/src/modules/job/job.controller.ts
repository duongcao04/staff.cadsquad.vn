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
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { APP_PERMISSIONS } from '@/utils'
import { AuditLog } from '../../common/decorators/audit-log.decorator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import {
    BadRequestResponseDto,
    ForbiddenResponseDto,
    NotFoundResponseDto,
    UnauthorizedResponseDto,
} from '../../common/swagger/api-response.dto'
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
import { JobResponseDto } from './dto/job-response.dto'
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
import { GetPayoutDetailsQuery } from './queries/impl/get-payout-details'
import { GetJobFinancialDetailsQuery } from './queries/impl/get-job-financial-details.query'
import { DeliverJobCommand } from './commands/impl/deliver-job.command'

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
@UseGuards(JwtGuard)
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

    // ─────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách job với bộ lọc & phân trang',
        description: `Trả về danh sách job theo quyền của user:
- **ADMIN / JOB.MANAGE**: thấy tất cả job
- **JOB.READ_ALL + scope DEPARTMENT**: chỉ thấy job trong cùng phòng ban
- **Còn lại**: chỉ thấy job mình tạo hoặc được assign vào

Hỗ trợ lọc theo tab, tìm kiếm theo tên/mã, sắp xếp, phân trang.`,
    })
    @ApiResponse({ status: 200, description: 'Danh sách job và meta phân trang' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async findAll(@Req() request: Request, @Query() query: JobQueryDto) {
        const user: TokenPayload = request['user']
        return this.queryBus.execute(new FindAllJobsQuery(user.sub, user.permissions, query))
    }

    @Get('workbench')
    @ApiOperation({
        summary: 'Lấy dữ liệu Workbench (bảng việc cá nhân)',
        description:
            'Giống `GET /jobs` nhưng tự động bật `hideFinishedJobs=true`. Dùng cho trang Workbench hiển thị công việc đang làm.',
    })
    @ApiResponse({ status: 200, description: 'Danh sách job cho workbench' })
    async getWorkbenchData(@Req() request: Request, @Query() query: JobQueryDto) {
        const user: TokenPayload = request['user']
        return this.queryBus.execute(
            new FindAllJobsQuery(user.sub, user.permissions, { ...query, hideFinishedJobs: true })
        )
    }

    @Get('no/:jobNo')
    @ApiOperation({
        summary: 'Lấy chi tiết job theo mã số job',
        description: 'Tra cứu job bằng mã hiển thị (ví dụ: `F260001`). Trả về đầy đủ thông tin bao gồm assignments, deliveries, comments.',
    })
    @ApiParam({ name: 'jobNo', description: 'Mã số job', example: 'F260001' })
    @ApiResponse({ status: 200, description: 'Chi tiết job', type: JobResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async findByNo(@Req() request: Request, @Param('jobNo') jobNo: string) {
        const user: TokenPayload = request['user']
        return this.queryBus.execute(new FindJobByNoQuery(user.sub, user.permissions, jobNo))
    }

    @Get('next-no')
    @ApiOperation({
        summary: 'Lấy mã số job tiếp theo',
        description: 'Tự động sinh mã job tiếp theo theo loại job (JobType). Dùng để pre-fill form tạo job mới.',
    })
    @ApiQuery({ name: 'typeId', description: 'UUID của JobType', example: 'uuid-of-job-type', required: true })
    @ApiResponse({
        status: 200,
        description: 'Mã job tiếp theo',
        schema: {
            example: { success: true, message: '', result: { nextNo: 'F260042' }, timestamp: '2026-05-26T07:00:00.000Z' },
        },
    })
    async getNextNo(@Query('typeId') typeId: string) {
        return this.jobTypeService.getNextJobNo(typeId)
    }

    @Get('due-at/:isoDate')
    @ApiOperation({
        summary: 'Lấy danh sách job có deadline vào ngày cụ thể',
        description: 'Trả về các job mà `dueAt` rơi vào ngày ISO được chỉ định. Dùng cho calendar view.',
    })
    @ApiParam({ name: 'isoDate', description: 'Ngày ISO 8601', example: '2026-06-15' })
    @ApiResponse({ status: 200, description: 'Danh sách job theo deadline' })
    async findJobsDueAt(@Req() request: Request, @Param('isoDate') isoDate: string) {
        const user: TokenPayload = request['user']
        return this.queryBus.execute(new FindJobsByDeadlineQuery(user.sub, user.permissions, isoDate))
    }

    @Get('pending-deliver')
    @ApiOperation({
        summary: 'Lấy danh sách job cần bàn giao',
        description:
            'Trả về các job mà user đang được assign nhưng chưa tạo delivery. Dùng cho nhắc nhở bàn giao.',
    })
    @ApiResponse({ status: 200, description: 'Danh sách job cần bàn giao' })
    async getPendingDeliver(@Req() request: Request) {
        const user: TokenPayload = request['user']
        return this.queryBus.execute(new FindJobsToDeliverQuery(user.sub, user.permissions))
    }

    @Get('pending-payouts')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.PAID])
    @ApiOperation({
        summary: 'Lấy danh sách job chờ thanh toán nhân công (Admin/Kế toán)',
        description: 'Trả về các job đã hoàn thành nhưng chưa thanh toán cho nhân viên. Yêu cầu quyền `job.paid`.',
    })
    @ApiResponse({ status: 200, description: 'Danh sách job chờ payout' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async getPendingPayouts() {
        return this.queryBus.execute(new FindJobsPendingPayoutsQuery())
    }

    @Get('payouts/:no')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.PAID])
    @ApiOperation({
        summary: 'Lấy chi tiết payout của một job',
        description: 'Trả về thông tin thanh toán nhân công: ai được trả, số tiền, trạng thái. Yêu cầu quyền `job.paid`.',
    })
    @ApiParam({ name: 'no', description: 'Mã số job', example: 'F260001' })
    @ApiResponse({ status: 200, description: 'Chi tiết payout' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async getPayoutDetails(@Req() request: Request, @Param('no') jobNo: string) {
        const user: TokenPayload = request['user']
        return this.queryBus.execute(new GetPayoutDetailsQuery(user.sub, user.permissions, jobNo))
    }

    @Get(':id/deliveries')
    @ResponseMessage('Get job deliveries successfully')
    @ApiOperation({
        summary: 'Lấy danh sách lần bàn giao của một job',
        description:
            'Trả về tất cả lần bàn giao (delivery attempts) của job: trạng thái PENDING/APPROVED/REJECTED, file đính kèm, ghi chú, feedback từ reviewer.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiResponse({
        status: 200,
        description: 'Danh sách deliveries',
        schema: {
            example: {
                success: true,
                message: 'Get job deliveries successfully',
                result: [
                    {
                        id: 'uuid',
                        status: 'PENDING',
                        note: 'Đã hoàn thành, link Figma: ...',
                        link: 'https://figma.com/...',
                        adminFeedback: null,
                        files: [],
                        createdAt: '2026-05-26T07:00:00.000Z',
                    },
                ],
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    async getJobDeliveries(@Param('id') id: string) {
        return this.jobDeliverService.getDeliveriesByJob(id)
    }

    @Get(':jobId/activity-logs')
    @ResponseMessage('Fetch activity logs successfully')
    @ApiOperation({
        summary: 'Lấy lịch sử hoạt động của job',
        description: `Trả về tất cả hành động đã thực hiện trên job theo thời gian: tạo job, assign member, đổi status, bàn giao, duyệt, thanh toán, v.v.

**Lưu ý về quyền hạn:**
- Log có \`activityType = PRIVATE\` hoặc chứa dữ liệu tài chính chỉ hiển thị nếu user có đủ quyền (ví dụ: \`job.readStaffCost\`).
- User thường chỉ thấy log công khai.`,
    })
    @ApiParam({ name: 'jobId', description: 'UUID của job' })
    @ApiResponse({ status: 200, description: 'Danh sách activity logs' })
    async getActivityLogs(@Param('jobId') jobId: string, @Req() request: Request) {
        const user: TokenPayload = request['user']
        return this.activityLogService.findByJobId(jobId, user.role.code, user.permissions)
    }

    @Get(':jobId/comments')
    @ResponseMessage('Fetch job comments successfully')
    @ApiOperation({
        summary: 'Lấy danh sách bình luận của job',
        description: 'Trả về tất cả comment kèm nested replies (có `parentId`). Sắp xếp theo thời gian tăng dần.',
    })
    @ApiParam({ name: 'jobId', description: 'UUID của job' })
    @ApiResponse({ status: 200, description: 'Danh sách comments' })
    async findAllComments(@Param('jobId') jobId: string) {
        return this.commentService.findAllByJob(jobId)
    }

    @Get(':id/financials')
    @ApiOperation({
        summary: 'Lấy chi tiết tài chính của job',
        description:
            'Trả về: doanh thu (incomeCost), tổng chi phí nhân công, danh sách transactions (INCOME/PAYOUT/REFUND). Chỉ user có quyền đọc tài chính mới thấy đầy đủ.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiResponse({ status: 200, description: 'Chi tiết tài chính job' })
    async getJobFinancials(@Param('id') id: string) {
        return this.queryBus.execute(new GetJobFinancialDetailsQuery(id))
    }

    // ─────────────────────────────────────────────
    // CREATE / ACTION
    // ─────────────────────────────────────────────

    @Post()
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.CREATE])
    @ResponseMessage('The job has been successfully created.')
    @AuditLog('Create new job', SystemModule.JOB)
    @ApiOperation({
        summary: 'Tạo job mới',
        description: `Tạo một job mới với đầy đủ thông tin. Yêu cầu quyền \`job.create\`.

**Luồng tạo job:**
1. Điền thông tin cơ bản (tên, loại, client, doanh thu, deadline)
2. Gán nhân viên kèm chi phí nhân công (\`jobAssignments\`)
3. Tuỳ chọn: kết nối SharePoint folder hoặc dùng folder template

Sau khi tạo, hệ thống tự động:
- Ghi AuditLog
- Gửi notification cho nhân viên được assign
- Tạo cấu trúc thư mục SharePoint (nếu có template)`,
    })
    @ApiBody({ type: CreateJobDto })
    @ApiResponse({ status: 201, description: 'Tạo job thành công', type: JobResponseDto })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async createJob(@Req() request: Request, @Body() createJobDto: CreateJobDto) {
        const user: TokenPayload = request['user']
        return this.commandBus.execute(new CreateJobCommand(user.sub, createJobDto))
    }

    @Post(':id/toggle-pin')
    @ApiOperation({
        summary: 'Ghim/Bỏ ghim job',
        description: 'Toggle trạng thái ghim của job cho user hiện tại. Job được ghim hiển thị ưu tiên trên Workbench.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiResponse({
        status: 200,
        description: 'Kết quả toggle pin',
        schema: {
            example: { success: true, message: '', result: { isPinned: true }, timestamp: '2026-05-26T07:00:00.000Z' },
        },
    })
    async togglePin(@Req() request: Request, @Param('id') jobId: string) {
        const user: TokenPayload = request['user']
        return this.jobService.togglePin(user.sub, jobId)
    }

    @Post(':id/deliver')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.DELIVER])
    @AuditLog('Delivered job', SystemModule.DELIVERY)
    @ApiOperation({
        summary: 'Bàn giao job (nhân viên nộp kết quả)',
        description: `Nhân viên nộp kết quả công việc để reviewer duyệt. Yêu cầu quyền \`job.deliver\`.

**Body:**
- \`note\`: Mô tả công việc đã làm, link tài liệu, hướng dẫn bàn giao (bắt buộc)
- \`link\`: Link kết quả (Figma, Drive, v.v.) nếu không upload file
- \`files\`: Danh sách file đã upload lên SharePoint

Sau khi bàn giao, job chuyển sang trạng thái **DELIVERED** và reviewer nhận notification.`,
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiBody({ type: DeliverJobDto })
    @ApiResponse({ status: 200, description: 'Bàn giao thành công' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async deliverJob(@Req() request: Request, @Param('id') id: string, @Body() data: DeliverJobDto) {
        const user: TokenPayload = request['user']
        return this.commandBus.execute(new DeliverJobCommand(user.sub, id, data))
    }

    @Post('deliver/:deliveryId/:action')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.REVIEW])
    @ApiOperation({
        summary: 'Duyệt hoặc từ chối bàn giao (Reviewer)',
        description: `Reviewer xem xét kết quả bàn giao và quyết định. Yêu cầu quyền \`job.review\`.

**action:**
- \`approve\`: Chấp nhận — job chuyển sang COMPLETED
- \`reject\`: Từ chối — nhân viên nhận feedback và cần bàn giao lại

**Body (chỉ cần khi reject):**
- \`feedback\`: Lý do từ chối, hướng dẫn sửa chữa`,
    })
    @ApiParam({ name: 'deliveryId', description: 'UUID của delivery cần duyệt' })
    @ApiParam({ name: 'action', description: 'approve hoặc reject', enum: ['approve', 'reject'] })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                feedback: {
                    type: 'string',
                    description: 'Feedback khi từ chối (bắt buộc nếu action = reject)',
                    example: 'Font chữ chưa đúng brand guideline, vui lòng sửa lại.',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Duyệt/Từ chối thành công' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto, description: 'action phải là approve hoặc reject' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
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
            new ReviewDeliveryCommand(user.sub, deliveryId, action === 'approve', data.feedback)
        )
    }

    @Post(':jobId/comments')
    @ResponseMessage('Đã đăng bình luận')
    @ApiOperation({
        summary: 'Đăng bình luận trên job',
        description: 'Thêm comment hoặc reply vào thread. Để reply, truyền `parentId` là ID của comment cha.',
    })
    @ApiParam({ name: 'jobId', description: 'UUID của job' })
    @ApiResponse({ status: 200, description: 'Comment đã được đăng' })
    async createComment(
        @Param('jobId') jobId: string,
        @Body() dto: CreateJobCommentDto,
        @Req() request: Request
    ) {
        const user: TokenPayload = request['user']
        return this.commentService.createComment(jobId, user.sub, dto)
    }

    @Post(':id/mark-paid')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.PAID])
    @AuditLog('Paid for job', SystemModule.FINANCIAL)
    @ApiOperation({
        summary: 'Xác nhận đã thanh toán nhân công cho job',
        description:
            'Đánh dấu job là đã thanh toán nhân công. Yêu cầu quyền `job.paid`. Hệ thống ghi Transaction PAYOUT cho từng nhân viên theo `staffCost`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiResponse({ status: 200, description: 'Xác nhận thanh toán thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async confirmPayment(@Req() request: Request, @Param('id') jobId: string) {
        const user: TokenPayload = request['user']
        return this.commandBus.execute(new ConfirmPaymentCommand(jobId, user.sub))
    }

    // ─────────────────────────────────────────────
    // UPDATE / PATCH
    // ─────────────────────────────────────────────

    @Patch(':id/general')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.UPDATE])
    @ResponseMessage('Update job successfully')
    @ApiOperation({
        summary: 'Cập nhật thông tin chung của job',
        description:
            'Cập nhật tên, client, ngày bắt đầu, deadline, mô tả. Tất cả fields đều optional — chỉ truyền field cần thay đổi. Yêu cầu quyền `job.update`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiBody({ type: UpdateGeneralJobDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async updateJob(
        @Req() request: Request,
        @Param('id') jobId: string,
        @Body() dto: UpdateGeneralJobDto & { attachments?: UpdateAttachmentsDto }
    ) {
        const user: TokenPayload = request['user']
        return this.commandBus.execute(new UpdateJobCommand(user.sub, jobId, dto))
    }

    @Patch(':id/assign')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.ASSIGNMENT])
    @ResponseMessage('Member assigned successfully')
    @AuditLog('Assign new member for job', SystemModule.JOB)
    @ApiOperation({
        summary: 'Gán thêm nhân viên vào job',
        description: 'Thêm một nhân viên vào job với chi phí nhân công xác định. Nhân viên nhận notification sau khi được gán.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiBody({ type: AssignMemberDto })
    @ApiResponse({ status: 200, description: 'Gán thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async assignMember(@Req() request: Request, @Param('id') id: string, @Body() dto: AssignMemberDto) {
        const user: TokenPayload = request['user']
        return this.commandBus.execute(new AssignMemberCommand(user.sub, id, dto))
    }

    @Patch(':id/assignments/:memberId')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.ASSIGNMENT])
    @ResponseMessage('Assignment cost updated')
    @ApiOperation({
        summary: 'Cập nhật chi phí nhân công cho một nhân viên',
        description: 'Thay đổi `staffCost` của một nhân viên trong job. Yêu cầu quyền `job.assignment`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiParam({ name: 'memberId', description: 'UUID của nhân viên trong assignment' })
    @ApiBody({ type: UpdateAssignmentDto })
    @ApiResponse({ status: 200, description: 'Cập nhật chi phí thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async updateAssignment(
        @Req() request: Request,
        @Param('id') jobId: string,
        @Param('memberId') memberId: string,
        @Body() dto: UpdateAssignmentDto
    ) {
        const user: TokenPayload = request['user']
        return this.commandBus.execute(new UpdateAssignmentCostCommand(user.sub, jobId, memberId, dto))
    }

    @Patch(':id/update-revenue')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.UPDATE])
    @AuditLog('Update revenue', SystemModule.FINANCIAL)
    @ApiOperation({
        summary: 'Cập nhật doanh thu và kênh thanh toán của job',
        description: 'Thay đổi `incomeCost` (doanh thu từ client) và/hoặc kênh thanh toán. Yêu cầu quyền `job.update`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiBody({ type: UpdateRevenueDto })
    @ApiResponse({ status: 200, description: 'Cập nhật doanh thu thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async updateRevenue(
        @Req() request: Request,
        @Param('id') id: string,
        @Body() updateRevenueDto: UpdateRevenueDto
    ) {
        const user: TokenPayload = request['user']
        return this.commandBus.execute(new UpdateFinancialDetailsCommand(user.sub, id, updateRevenueDto))
    }

    @Patch(':id/change-status')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.UPDATE])
    @AuditLog('Force update job status', SystemModule.JOB)
    @ApiOperation({
        summary: 'Thay đổi trạng thái job (bắt buộc)',
        description: `Buộc chuyển job sang trạng thái mới. Yêu cầu quyền \`job.update\`.

**Lưu ý:** API này bypass luồng bàn giao/duyệt thông thường. Chỉ dùng khi cần admin can thiệp.
Hệ thống sẽ ghi \`JobStatusHistory\` với timestamp để theo dõi thời gian ở mỗi trạng thái.`,
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiBody({ type: ChangeStatusDto })
    @ApiResponse({ status: 200, description: 'Đổi trạng thái thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async changeStatus(@Req() request: Request, @Param('id') id: string, @Body() data: ChangeStatusDto) {
        const user: TokenPayload = request['user']
        return this.commandBus.execute(new ForceChangeStatusCommand(id, user.sub, data))
    }

    // ─────────────────────────────────────────────
    // DELETE / RESTORE
    // ─────────────────────────────────────────────

    @Delete(':id')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.DELETE])
    @AuditLog('Cancelled job', SystemModule.JOB)
    @ApiOperation({
        summary: 'Huỷ/Xoá mềm job',
        description:
            'Đánh dấu `deletedAt` (xoá mềm). Job bị huỷ không hiển thị trong danh sách mặc định. Có thể khôi phục bằng `PATCH /:id/restore`. Yêu cầu quyền `job.delete`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job cần huỷ' })
    @ApiResponse({ status: 200, description: 'Huỷ job thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async remove(@Req() request: Request, @Param('id') id: string) {
        const user: TokenPayload = request['user']
        request['auditTargetId'] = id
        const jobDetails = await this.jobService.findOne(id)
        request['auditTargetDisplay'] = `${jobDetails?.no}- ${jobDetails?.displayName}`
        return this.commandBus.execute(new SoftDeleteJobCommand(id, user.sub))
    }

    @Patch(':id/restore')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.DELETE])
    @AuditLog('Restored job', SystemModule.JOB)
    @ApiOperation({
        summary: 'Khôi phục job đã huỷ',
        description: 'Xoá `deletedAt`, đưa job về trạng thái trước khi huỷ. Yêu cầu quyền `job.delete`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job cần khôi phục' })
    @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async restore(@Req() request: Request, @Param('id') id: string) {
        const user: TokenPayload = request['user']
        request['auditTargetId'] = id
        const jobDetails = await this.jobService.findOne(id)
        request['auditTargetDisplay'] = `${jobDetails?.no}- ${jobDetails?.displayName}`
        return this.commandBus.execute(new RestoreJobCommand(id, user.sub))
    }

    @Delete(':id/assignments/:memberId')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.JOB.ASSIGNMENT])
    @AuditLog('Remove assignment member from job', SystemModule.JOB)
    @ApiOperation({
        summary: 'Gỡ nhân viên khỏi job',
        description: 'Xoá assignment của một nhân viên khỏi job. Yêu cầu quyền `job.assignment`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job' })
    @ApiParam({ name: 'memberId', description: 'UUID của nhân viên cần gỡ' })
    @ApiResponse({ status: 200, description: 'Gỡ nhân viên thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async unassignMember(
        @Req() request: Request,
        @Param('id') jobId: string,
        @Param('memberId') memberId: string
    ) {
        const user: TokenPayload = request['user']
        return this.commandBus.execute(new RemoveMemberCommand(user.sub, jobId, memberId))
    }
}
