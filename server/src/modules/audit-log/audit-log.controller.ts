import {
    Controller,
    Get,
    HttpCode,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import {
    ForbiddenResponseDto,
    UnauthorizedResponseDto,
} from '../../common/swagger/api-response.dto'
import { APP_PERMISSIONS } from '@/utils'
import { JwtGuard } from '../auth/jwt.guard'
import { AuditLogService } from './audit-log.service'
import { SystemModule } from '../../generated/prisma'

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtGuard)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of audit logs successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.SYSTEM.MANAGE])
    @ApiOperation({
        summary: 'Lấy danh sách audit logs',
        description:
            'Trả về nhật ký thao tác toàn hệ thống. Có thể lọc theo `module`. Yêu cầu quyền `system.manage`.',
    })
    @ApiQuery({
        name: 'module',
        required: false,
        description: 'Lọc theo module hệ thống',
        enum: SystemModule,
        example: SystemModule.JOB,
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách audit logs',
        schema: {
            example: {
                success: true,
                message: 'Get list of audit logs successfully',
                result: [
                    {
                        id: 'uuid',
                        userId: 'uuid-user',
                        action: 'Create new job',
                        module: 'JOB',
                        targetId: 'uuid-job',
                        ipAddress: '192.168.1.1',
                        createdAt: '2026-05-26T07:00:00.000Z',
                    },
                ],
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async findAll(@Query('module') moduleName?: SystemModule) {
        if (moduleName) return this.auditLogService.findByModule(moduleName)
        return this.auditLogService.findAll()
    }

    @Get('target/:targetId')
    @HttpCode(200)
    @ResponseMessage('Get audit logs by target successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.SYSTEM.MANAGE])
    @ApiOperation({
        summary: 'Lấy audit logs theo target ID',
        description:
            'Trả về lịch sử thao tác trên một đối tượng cụ thể (VD: một job, một user). Yêu cầu quyền `system.manage`.',
    })
    @ApiParam({
        name: 'targetId',
        description: 'UUID của đối tượng cần xem lịch sử thao tác',
        example: 'uuid-of-job-or-user',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách audit logs theo target',
        schema: {
            example: {
                result: [
                    { id: 'uuid', action: 'Update job status', userId: 'uuid-user', createdAt: '2026-05-26' },
                ],
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async findByTargetId(@Param('targetId') targetId: string) {
        return this.auditLogService.findByTargetId(targetId)
    }
}
