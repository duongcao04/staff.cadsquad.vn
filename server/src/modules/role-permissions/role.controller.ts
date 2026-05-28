import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import { isUUID } from 'class-validator'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import {
    BadRequestResponseDto,
    ForbiddenResponseDto,
    NotFoundResponseDto,
    UnauthorizedResponseDto,
} from '../../common/swagger/api-response.dto'
import { APP_PERMISSIONS } from '../../utils'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateRoleDto } from './dtos/create-role.dto'
import { PermissionService } from './permission.service'
import { RoleService } from './role.service'

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtGuard)
export class RoleController {
    constructor(
        private readonly roleService: RoleService,
        private readonly permissionService: PermissionService
    ) {}

    @Get()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy danh sách tất cả vai trò',
        description: 'Trả về toàn bộ roles trong hệ thống cùng số lượng thành viên.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách roles',
        schema: {
            example: [{ id: 'uuid', code: 'ADMIN', displayName: 'Administrator', memberCount: 3 }],
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    findAll() {
        return this.roleService.findAll()
    }

    @Get('permissions')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy toàn bộ danh sách permissions',
        description: 'Trả về tất cả permission codes trong hệ thống. Dùng để hiển thị danh sách phân quyền.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách permissions',
        schema: {
            example: [{ id: 'uuid', code: 'job.read', entityAction: 'JOB.READ', description: 'Xem danh sách job' }],
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    allPermissions() {
        return this.permissionService.findAll()
    }

    @Get('permissions/grouped')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy permissions theo nhóm (dùng cho UI checkbox)',
        description: 'Trả về permissions đã nhóm theo module. Thích hợp để render checkbox group trong UI phân quyền.',
    })
    @ApiResponse({
        status: 200,
        description: 'Permissions nhóm theo module',
        schema: {
            example: {
                JOB: [
                    { id: 'uuid', code: 'job.read', description: 'Xem job' },
                    { id: 'uuid', code: 'job.create', description: 'Tạo job' },
                ],
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    getPermissions() {
        return this.permissionService.findAllGrouped()
    }

    @Get(':identify')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy chi tiết role theo ID hoặc code',
        description: 'Trả về thông tin role cùng danh sách permissions được gán. Nếu `identify` là UUID → tìm theo ID, còn lại tìm theo code.',
    })
    @ApiParam({ name: 'identify', description: 'UUID hoặc code của role', example: 'ADMIN' })
    @ApiResponse({ status: 200, description: 'Chi tiết role' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    findRoleDetail(@Param('identify') identify: string) {
        if (isUUID(identify)) return this.roleService.findById(identify)
        return this.roleService.findByCode(identify)
    }

    @Patch(':id/permissions/bulk')
    @HttpCode(200)
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
    @ApiOperation({
        summary: 'Cập nhật hàng loạt permissions cho role',
        description:
            'Thay thế toàn bộ permissions của role bằng danh sách `permissionIds` mới. Yêu cầu quyền `role.manage`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của role', example: 'uuid-of-role' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['permissionIds'],
            properties: {
                permissionIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Danh sách UUID permission mới',
                    example: ['uuid-perm-1', 'uuid-perm-2'],
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Permissions của role đã được cập nhật' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async toggleRolePermission(
        @Param('id') roleId: string,
        @Body('permissionIds') permissionIds: string[]
    ) {
        return this.roleService.updatePermissions(roleId, permissionIds)
    }

    @Post()
    @HttpCode(201)
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
    @ApiOperation({
        summary: 'Tạo role mới',
        description: 'Tạo một vai trò mới. Yêu cầu quyền `role.manage`.',
    })
    @ApiBody({ type: CreateRoleDto })
    @ApiResponse({ status: 201, description: 'Role đã được tạo' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto)
    }

    @Post(':roleId/members/:userId')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Thêm user vào role',
        description: 'Gán user vào role. Yêu cầu quyền `role.manage`.',
    })
    @ApiParam({ name: 'roleId', description: 'UUID của role', example: 'uuid-of-role' })
    @ApiParam({ name: 'userId', description: 'UUID của user', example: 'uuid-of-user' })
    @ResponseMessage('User added to role successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
    @ApiResponse({ status: 200, description: 'User đã được thêm vào role' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async addMember(
        @Param('roleId') roleId: string,
        @Param('userId') userId: string
    ) {
        return this.roleService.addMember(userId, roleId)
    }

    @Delete('members/:userId')
    @HttpCode(200)
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
    @ApiOperation({
        summary: 'Xóa user khỏi role hiện tại',
        description: 'Gỡ user khỏi role. User sẽ không còn vai trò và mất quyền liên quan.',
    })
    @ApiParam({ name: 'userId', description: 'UUID của user cần xóa khỏi role', example: 'uuid-of-user' })
    @ApiResponse({ status: 200, description: 'User đã bị gỡ khỏi role' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async removeMember(@Param('userId') userId: string) {
        return this.roleService.removeMember(userId)
    }

    @Delete(':id')
    @HttpCode(200)
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
    @ApiOperation({
        summary: 'Xóa role',
        description: 'Xóa vĩnh viễn role theo ID. Yêu cầu quyền `role.manage`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của role cần xóa', example: 'uuid-of-role' })
    @ApiResponse({ status: 200, description: 'Role đã được xóa' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.roleService.remove(id)
    }
}
