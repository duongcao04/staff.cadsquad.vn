import { Body, Controller, Delete, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import {
    BadRequestResponseDto,
    NotFoundResponseDto,
    UnauthorizedResponseDto,
} from '../../../common/swagger/api-response.dto'
import { JwtGuard } from '../../auth/jwt.guard'
import { AdminUsersService } from './admin-users.service'

@ApiTags('Admin — Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtGuard)
export class AdminUsersController {
    constructor(private readonly adminUsersService: AdminUsersService) {}

    @Patch(':id/status')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Bật/tắt tài khoản user',
        description: 'Admin kích hoạt hoặc vô hiệu hóa tài khoản user theo ID. User bị tắt sẽ không thể đăng nhập.',
    })
    @ApiParam({ name: 'id', description: 'UUID của user', example: 'uuid-of-user' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['isActive'],
            properties: {
                isActive: { type: 'boolean', description: 'true = kích hoạt, false = vô hiệu hóa', example: false },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Trạng thái tài khoản đã được cập nhật' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.adminUsersService.toggleUserStatus(id, isActive)
    }

    @Post(':id/force-logout')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Buộc đăng xuất user khỏi tất cả thiết bị',
        description: 'Admin xóa toàn bộ session của user trong Redis. User sẽ bị đăng xuất tức thì.',
    })
    @ApiParam({ name: 'id', description: 'UUID của user cần force logout', example: 'uuid-of-user' })
    @ApiResponse({ status: 200, description: 'Tất cả session của user đã bị xóa' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async forceLogout(@Param('id') id: string) {
        return this.adminUsersService.forceLogoutAllDevices(id)
    }

    @Delete(':id')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Xóa vĩnh viễn tài khoản user (Admin)',
        description: 'Xóa hoàn toàn user và tất cả dữ liệu liên quan. Hành động không thể hoàn tác.',
    })
    @ApiParam({ name: 'id', description: 'UUID của user cần xóa', example: 'uuid-of-user' })
    @ApiResponse({ status: 200, description: 'User đã được xóa vĩnh viễn' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async deleteUser(@Param('id') id: string) {
        return this.adminUsersService.forceDeleteUser(id)
    }
}
