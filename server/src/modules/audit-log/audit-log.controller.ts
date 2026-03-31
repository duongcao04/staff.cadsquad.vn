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
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { APP_PERMISSIONS } from '@/utils'
import { JwtGuard } from '../auth/jwt.guard'
import { AuditLogService } from './audit-log.service'
import { SystemModule } from '../../generated/prisma'

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of audit logs successfully')
    @ApiOperation({ summary: 'Get all audit logs' })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.SYSTEM.MANAGE)
    async findAll(@Query('module') moduleName?: SystemModule) {
        if (moduleName) {
            return this.auditLogService.findByModule(moduleName)
        }
        return this.auditLogService.findAll()
    }

    @Get('target/:targetId')
    @HttpCode(200)
    @ResponseMessage('Get audit logs by target successfully')
    @ApiOperation({ summary: 'Get audit logs for a specific target' })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.SYSTEM.MANAGE)
    async findByTargetId(@Param('targetId') targetId: string) {
        return this.auditLogService.findByTargetId(targetId)
    }
}
