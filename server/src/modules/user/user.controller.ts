import { BypassTransform } from '@/common/decorators/bypass.decorator'
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator'
import { ResponseMessage } from '@/common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '@/common/guards/permissions.guard'
import {
    BadRequestResponseDto,
    ForbiddenResponseDto,
    NotFoundResponseDto,
    UnauthorizedResponseDto,
} from '@/common/swagger/api-response.dto'
import { TokenPayload } from '@/modules/auth/dto/token-payload.dto'
import { JwtGuard } from '@/modules/auth/jwt.guard'
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
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
import { isUUID } from 'class-validator'
import { AuditLog } from '../../common/decorators/audit-log.decorator'
import { SystemModule } from '../../generated/prisma'
import { AssignUserPermissionDto, PermissionScope } from './dto/assign-user-permission.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { ProtectUserResponseDto } from './dto/protect-user-response.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserQueryDto } from './dto/user-query.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { GetScheduleQuery } from './queries/impl/get-schedule.query'
import { UserSecurityService } from './user-security.service'
import { UserService } from './user.service'
import { plainToInstance } from 'class-transformer'

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userSecurityService: UserSecurityService,
        private readonly queryBus: QueryBus
    ) {}

    @Get('search')
    @HttpCode(200)
    @ResponseMessage('Search user successfully')
    @ApiOperation({
        summary: 'Tìm kiếm nhân viên nhanh',
        description:
            'Tìm kiếm theo tên, email hoặc username. Dùng cho autocomplete khi assign member vào job. Trả về danh sách user khớp.',
    })
    @ApiQuery({ name: 'q', description: 'Từ khoá tìm kiếm (tên, email, username)', example: 'nguyen' })
    @ApiResponse({
        status: 200,
        description: 'Danh sách user khớp',
        type: [ProtectUserResponseDto],
    })
    async search(@Query('q') query: string) {
        if (!query) return []
        return this.userService.search(query)
    }

    @Get('schedule')
    @HttpCode(200)
    @ResponseMessage('Get profile schedules successfully')
    @ApiOperation({
        summary: 'Lấy lịch công việc của user đang đăng nhập',
        description:
            'Trả về danh sách job có deadline trong tháng/ngày được chỉ định. Áp dụng scope: nếu là ADMIN thấy tất cả, ngược lại chỉ thấy job được assign hoặc tự tạo.',
    })
    @ApiQuery({ name: 'month', description: 'Tháng (1-12)', example: 6, required: true })
    @ApiQuery({ name: 'year', description: 'Năm', example: 2026, required: true })
    @ApiQuery({ name: 'day', description: 'Ngày cụ thể trong tháng (tuỳ chọn)', example: 15, required: false })
    @ApiResponse({
        status: 200,
        description: 'Lịch công việc',
        schema: {
            example: {
                success: true,
                message: 'Get profile schedules successfully',
                result: {
                    jobsSchedule: [{ id: 'uuid', no: 'F260001', displayName: 'Thiết kế logo', dueAt: '2026-06-15T23:59:59.000Z', status: {} }],
                    meta: { start: '2026-06-01', end: '2026-06-30', type: 'month', total: 1 },
                },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    async schedule(
        @Req() request: Request,
        @Query('day') day: number,
        @Query('month') month: number,
        @Query('year') year: number
    ) {
        const userPayload: TokenPayload = await request['user']
        if (!month && !year) return []
        return this.queryBus.execute(new GetScheduleQuery(userPayload.sub, month, year, day))
    }

    @Post()
    @HttpCode(201)
    @ResponseMessage('Create user successfully')
    @ApiOperation({
        summary: 'Tạo tài khoản nhân viên mới',
        description:
            'Tạo tài khoản và gửi email mời nếu `sendInviteEmail=1`. Yêu cầu quyền `user.create`. Hệ thống tự sinh `username` và `code` nhân viên.',
    })
    @ApiQuery({ name: 'sendInviteEmail', description: '1 để gửi email mời, 0 để bỏ qua', enum: ['0', '1'], required: false })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'Tạo thành công', type: UserResponseDto })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    @AuditLog('Created new User', SystemModule.USER_MANAGEMENT)
    async create(
        @Req() request: Request,
        @Body() createUserDto: CreateUserDto,
        @Query() sendInviteEmail: '0' | '1'
    ) {
        const isSendInviteEmail = Boolean(sendInviteEmail)
        const result = await this.userService.create(createUserDto, isSendInviteEmail)
        request['auditTargetDisplay'] = `${result.code}- ${result.displayName}`
        request['auditTargetId'] = result.id
        return result
    }

    @Get('security-logs')
    @ApiOperation({
        summary: 'Lấy lịch sử bảo mật của user đang đăng nhập',
        description:
            'Trả về các sự kiện bảo mật gần nhất: đăng nhập, đổi mật khẩu, thu hồi session, v.v. Dùng cho màn hình "Hoạt động bảo mật".',
    })
    @ApiQuery({ name: 'limit', description: 'Số lượng log muốn lấy (mặc định: 10)', example: 10, required: false })
    @ApiResponse({
        status: 200,
        description: 'Danh sách security logs',
        schema: {
            example: {
                success: true,
                message: '',
                result: [
                    { event: 'Login Success', status: 'SUCCESS', ipAddress: '192.168.1.1', createdAt: '2026-05-26T07:00:00.000Z' },
                ],
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    async getRecentActivity(
        @Req() request: Request,
        @Query('limit') limit: number = 10
    ) {
        const userPayload: TokenPayload = await request['user']
        return this.userSecurityService.getSecurityLogs(userPayload.sub, limit)
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of users successfully')
    @ApiOperation({
        summary: 'Lấy danh sách toàn bộ nhân viên',
        description:
            'Hỗ trợ tìm kiếm, lọc theo phòng ban/role, phân trang. Trả về `ProtectUserResponseDto` (ẩn thông tin nhạy cảm như password, ID).',
    })
    @ApiResponse({ status: 200, description: 'Danh sách nhân viên', type: [ProtectUserResponseDto] })
    async findAll(@Query() query: UserQueryDto) {
        return this.userService.findAll(query)
    }

    @Post(':id/permissions')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.USER.UPDATE])
    @ApiOperation({
        summary: 'Cấp/thu hồi/reset quyền đặc biệt cho user',
        description: `Quản lý permission override tại tầng user (ghi đè Role).
- **GRANT**: Cấp thêm quyền này cho user, kèm **scope** giới hạn phạm vi dữ liệu.
- **DENY**: Cấm quyền này kể cả khi Role của user có quyền đó.
- **INHERIT**: Xoá override, trả về tuân theo Role.

**Scope** chỉ có nghĩa khi action = GRANT:
- \`OWN\` — chỉ thấy record mình tạo hoặc được assign
- \`DEPARTMENT\` — thấy record trong cùng phòng ban
- \`ALL\` — thấy tất cả (mặc định)`,
    })
    @ApiParam({ name: 'id', description: 'UUID của user cần cập nhật quyền' })
    @ApiBody({ type: AssignUserPermissionDto })
    @ApiResponse({
        status: 200,
        description: 'Kết quả cập nhật quyền',
        schema: {
            example: {
                success: true,
                message: '',
                result: {
                    message: 'Permission explicitly GRANTED with scope: DEPARTMENT',
                    data: { id: 'uuid', userId: 'uuid', permissionId: 'uuid', isDenied: false, scope: 'DEPARTMENT' },
                },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto, description: 'User hoặc Permission không tồn tại' })
    async managePermission(
        @Param('id', ParseUUIDPipe) userId: string,
        @Body() dto: AssignUserPermissionDto
    ) {
        return this.userService.manageUserPermission(userId, dto)
    }

    @Patch('update-password')
    @HttpCode(200)
    @ResponseMessage('Update password successfully')
    @ApiOperation({
        summary: 'Đổi mật khẩu (user tự đổi)',
        description: 'User tự đổi mật khẩu của mình. Cần cung cấp mật khẩu cũ để xác minh.',
    })
    @ApiBody({ type: UpdatePasswordDto })
    @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto, description: 'Mật khẩu cũ không đúng hoặc mật khẩu mới không khớp' })
    async updatePassword(@Req() request: Request, @Body() dto: UpdatePasswordDto) {
        const userPayload: TokenPayload = await request['user']
        return this.userService.updatePassword(userPayload.sub, dto)
    }

    @Patch(':id/reset-password')
    @HttpCode(200)
    @ResponseMessage('Reset password successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.USER.RESET_PASSWORD])
    @ApiOperation({
        summary: 'Reset mật khẩu cho nhân viên (Admin)',
        description: 'Admin đặt lại mật khẩu mới cho nhân viên. Yêu cầu quyền `user.resetPassword`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của user cần reset mật khẩu' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Reset mật khẩu thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
        return this.userService.resetPassword(id, dto)
    }

    @Get('check-username')
    @HttpCode(200)
    @ResponseMessage('Check username successfully')
    @ApiOperation({
        summary: 'Kiểm tra username đã tồn tại chưa',
        description: 'Dùng cho form tạo/cập nhật user để validate real-time.',
    })
    @ApiQuery({ name: 'username', description: 'Username cần kiểm tra', example: 'nguyen.van.a' })
    @ApiResponse({
        status: 200,
        description: 'Kết quả kiểm tra',
        schema: {
            example: {
                success: true,
                message: 'Check username successfully',
                result: { isExist: false },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    async checkUsernameTaken(@Query('username') username: string) {
        const isExist = await this.userService.isUsernameTaken(username)
        return { isExist }
    }

    @Get(':identifier')
    @HttpCode(200)
    @ResponseMessage('Get user detail successfully')
    @ApiOperation({
        summary: 'Lấy thông tin chi tiết một nhân viên',
        description: 'Hỗ trợ tra cứu bằng UUID hoặc staff code (ví dụ: `ST001`). Hệ thống tự nhận biết loại identifier.',
    })
    @ApiParam({
        name: 'identifier',
        description: 'UUID hoặc staff code của nhân viên',
        example: 'ST001',
    })
    @ApiResponse({ status: 200, description: 'Thông tin nhân viên', type: UserResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async findOne(@Param('identifier') identifier: string) {
        if (isUUID(identifier)) {
            const userData = await this.userService.findById(identifier)
            return plainToInstance(UserResponseDto, userData, { excludeExtraneousValues: true })
        }
        const userData = await this.userService.findByStaffCode(identifier)
        return plainToInstance(UserResponseDto, userData, { excludeExtraneousValues: true })
    }

    @Patch(':username')
    @HttpCode(200)
    @ResponseMessage('Update user successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.USER.UPDATE])
    @ApiOperation({
        summary: 'Cập nhật thông tin nhân viên (Admin)',
        description:
            'Cập nhật thông tin nhân viên theo username. Yêu cầu quyền `user.update`. Chỉ truyền các field cần thay đổi.',
    })
    @ApiParam({ name: 'username', description: 'Username của nhân viên', example: 'nguyen.van.a' })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: UserResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async update(@Param('username') username: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(username, updateUserDto)
    }

    @Patch(':id/assign-role')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE, APP_PERMISSIONS.USER.UPDATE])
    @ResponseMessage('Assign role for user successfully')
    @ApiOperation({
        summary: 'Gán Role cho nhân viên',
        description: 'Thay đổi Role của nhân viên. Yêu cầu đồng thời hai quyền: `role.manage` và `user.update`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của nhân viên' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                roleId: { type: 'string', description: 'UUID của Role mới', example: 'uuid-of-role' },
            },
            required: ['roleId'],
        },
    })
    @ApiResponse({ status: 200, description: 'Gán role thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async assignUserRole(@Param('id') id: string, @Body('roleId') roleId: string) {
        return this.userService.assignRole(id, roleId)
    }

    @Patch(':id/status')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.USER.BLOCK])
    @ResponseMessage('User status updated successfully')
    @ApiOperation({
        summary: 'Khoá/Mở khoá tài khoản nhân viên',
        description: 'Thay đổi trạng thái `isActive` của nhân viên. Tài khoản bị khoá sẽ không đăng nhập được. Yêu cầu quyền `user.block`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của nhân viên' })
    @ApiQuery({ name: 'isActive', description: '"true" để mở khoá, "false" để khoá', example: 'false' })
    @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async toggleStatus(
        @Param('id') id: string,
        @Req() request: Request,
        @Query('isActive') isActive: string
    ) {
        const userPayload: TokenPayload = await request['user']
        return this.userService.toggleUserStatus(userPayload.sub, id, isActive)
    }

    @Delete(':id')
    @HttpCode(204)
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.USER.DELETE])
    @BypassTransform()
    @ApiOperation({
        summary: 'Xoá mềm tài khoản nhân viên',
        description:
            'Đánh dấu `deletedAt` thay vì xoá vĩnh viễn. Tài khoản vẫn tồn tại trong DB và có thể khôi phục. Yêu cầu quyền `user.delete`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của nhân viên cần xoá' })
    @ApiResponse({
        status: 200,
        description: 'Xoá thành công (bypass envelope)',
        schema: { example: { success: true, message: 'User deleted successfully', timestamp: '2026-05-26T07:00:00.000Z' } },
    })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async remove(@Param('id') id: string) {
        const softDeleted = await this.userService.softDelete(id)
        return { success: true, message: softDeleted.message, timestamp: new Date().toISOString() }
    }

    @Patch(':id/restore')
    @HttpCode(204)
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.USER.DELETE])
    @BypassTransform()
    @ApiOperation({
        summary: 'Khôi phục tài khoản nhân viên đã xoá',
        description: 'Xoá `deletedAt`, kích hoạt lại tài khoản. Yêu cầu quyền `user.delete`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của nhân viên cần khôi phục' })
    @ApiResponse({
        status: 200,
        description: 'Khôi phục thành công (bypass envelope)',
        schema: { example: { success: true, message: 'User restored successfully', timestamp: '2026-05-26T07:00:00.000Z' } },
    })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async restore(@Param('id') id: string) {
        const restored = await this.userService.restore(id)
        return { success: true, message: restored.message, timestamp: new Date().toISOString() }
    }
}
