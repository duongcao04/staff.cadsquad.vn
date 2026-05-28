import { APP_PERMISSIONS } from '@/utils'
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { isUUID } from 'class-validator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { AuditLog } from '../../common/decorators/audit-log.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import {
    BadRequestResponseDto,
    ForbiddenResponseDto,
    NotFoundResponseDto,
    UnauthorizedResponseDto,
} from '../../common/swagger/api-response.dto'
import { SystemModule } from '../../generated/prisma'
import { JwtGuard } from '../auth/jwt.guard'
import { DepartmentService } from './department.service'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { DepartmentResponseDto } from './dto/department-response.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
@UseGuards(JwtGuard)
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}

    @Post()
    @HttpCode(201)
    @ResponseMessage('Insert new department successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.DEPARTMENT.CREATE])
    @AuditLog('Create new department', SystemModule.SYSTEM)
    @ApiOperation({
        summary: 'Tạo phòng ban mới',
        description: 'Tạo một phòng ban mới trong tổ chức. Yêu cầu quyền `department.create`.',
    })
    @ApiBody({ type: CreateDepartmentDto })
    @ApiResponse({
        status: 201,
        description: 'Phòng ban đã được tạo thành công',
        type: DepartmentResponseDto,
    })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async create(
        @Req() request: Request,
        @Body() createDepartmentDto: CreateDepartmentDto
    ) {
        const created = await this.departmentService.create(createDepartmentDto)
        request['auditTargetId'] = created.id
        request['auditTargetDisplay'] = created.displayName
        return created
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of departments successfully')
    @ApiOperation({
        summary: 'Lấy danh sách tất cả phòng ban',
        description: 'Trả về danh sách toàn bộ phòng ban trong tổ chức cùng số lượng nhân viên.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách phòng ban',
        type: [DepartmentResponseDto],
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async findAll() {
        return this.departmentService.findAll()
    }

    @Get(':identifier')
    @HttpCode(200)
    @ResponseMessage('Get department detail successfully')
    @ApiOperation({
        summary: 'Lấy chi tiết phòng ban theo ID hoặc code',
        description:
            'Nếu `identifier` là UUID → tìm theo ID. Ngược lại → tìm theo code nội bộ (VD: DEP-DESIGN).',
    })
    @ApiParam({
        name: 'identifier',
        description: 'UUID của phòng ban hoặc code nội bộ',
        example: 'DEP-DESIGN',
    })
    @ApiResponse({
        status: 200,
        description: 'Chi tiết phòng ban',
        type: DepartmentResponseDto,
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async findOne(@Param('identifier') identifier: string) {
        if (isUUID(identifier)) {
            return this.departmentService.findById(identifier)
        }
        return this.departmentService.findByCode(identifier)
    }

    @Patch(':id')
    @HttpCode(200)
    @ResponseMessage('Update department successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.DEPARTMENT.UPDATE])
    @ApiOperation({
        summary: 'Cập nhật thông tin phòng ban',
        description: 'Cập nhật tên, mã, mô tả của phòng ban. Yêu cầu quyền `department.update`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của phòng ban cần cập nhật', example: 'uuid-of-department' })
    @ApiBody({ type: UpdateDepartmentDto })
    @ApiResponse({
        status: 200,
        description: 'Phòng ban đã được cập nhật',
        type: DepartmentResponseDto,
    })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async update(
        @Param('id') id: string,
        @Body() updateDepartmentDto: UpdateDepartmentDto
    ) {
        return this.departmentService.update(id, updateDepartmentDto)
    }

    @Delete(':id')
    @HttpCode(200)
    @ResponseMessage('Delete department successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.DEPARTMENT.DELETE])
    @ApiOperation({
        summary: 'Xóa phòng ban',
        description:
            'Xóa phòng ban theo ID. Yêu cầu quyền `department.delete`. Không thể xóa nếu phòng ban còn nhân viên.',
    })
    @ApiParam({ name: 'id', description: 'UUID của phòng ban cần xóa', example: 'uuid-of-department' })
    @ApiResponse({ status: 200, description: 'Phòng ban đã được xóa' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto, description: 'Phòng ban còn nhân viên' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async remove(@Param('id') id: string) {
        return this.departmentService.delete(id)
    }
}
