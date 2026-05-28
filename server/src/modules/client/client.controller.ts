import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
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
import { APP_PERMISSIONS } from '@/utils'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { ClientService } from './client.service'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(JwtGuard)
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get all clients successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.CLIENT.READ])
    @ApiOperation({
        summary: 'Lấy danh sách tất cả khách hàng',
        description: 'Trả về toàn bộ danh sách client trong hệ thống. Yêu cầu quyền `client.read`.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách khách hàng',
        schema: {
            example: {
                success: true,
                message: 'Get all clients successfully',
                result: [
                    {
                        id: 'uuid',
                        name: 'ABC Corporation',
                        code: 'ABC-CORP',
                        type: 'COMPANY',
                        email: 'contact@abccorp.com',
                        phoneNumber: '+84901234567',
                    },
                ],
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async getAll() {
        return this.clientService.findAll()
    }

    @Get('search-by-name')
    @HttpCode(200)
    @ResponseMessage('Search client by name results')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.CLIENT.READ])
    @ApiOperation({
        summary: 'Tìm kiếm client theo tên',
        description: 'Tìm kiếm client theo `name` (partial match). Nếu không truyền `name`, trả về `null`.',
    })
    @ApiQuery({
        name: 'name',
        required: true,
        description: 'Chuỗi tìm kiếm theo tên client',
        example: 'ABC',
    })
    @ApiResponse({ status: 200, description: 'Kết quả tìm kiếm' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async getByName(@Query('name') name: string) {
        if (!name) return { result: null }
        return this.clientService.findByName(name)
    }

    @Get(':identifier')
    @HttpCode(200)
    @ResponseMessage('Get client details successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.CLIENT.READ])
    @ApiOperation({
        summary: 'Lấy chi tiết một client theo ID hoặc code',
        description: 'Nếu `identifier` là UUID → tìm theo ID. Ngược lại → tìm theo `code`.',
    })
    @ApiParam({
        name: 'identifier',
        description: 'UUID của client hoặc code nội bộ (VD: ABC-CORP)',
        example: 'ABC-CORP',
    })
    @ApiResponse({ status: 200, description: 'Chi tiết client' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async getOne(@Param('identifier') identifier: string) {
        if (isUUID(identifier)) {
            return this.clientService.findOne(identifier)
        }
        return this.clientService.findByCode(identifier)
    }

    @Post()
    @HttpCode(201)
    @ResponseMessage('Create new client successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.CLIENT.WRITE])
    @AuditLog('Create new client', SystemModule.CLIENT)
    @ApiOperation({
        summary: 'Tạo khách hàng mới',
        description: 'Tạo một client mới trong hệ thống. Yêu cầu quyền `client.write`.',
    })
    @ApiBody({ type: CreateClientDto })
    @ApiResponse({
        status: 201,
        description: 'Client đã được tạo thành công',
        schema: {
            example: {
                success: true,
                message: 'Create new client successfully',
                result: { id: 'uuid', name: 'ABC Corporation', code: 'ABC-CORP', type: 'COMPANY' },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    async create(@Req() request: Request, @Body() dto: CreateClientDto) {
        const created = await this.clientService.create(dto)
        request['auditTargetId'] = created.id
        request['auditTargetDisplay'] = created.name
        return created
    }

    @Patch(':id')
    @HttpCode(200)
    @ResponseMessage('Client updated successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions([APP_PERMISSIONS.CLIENT.WRITE])
    @ApiOperation({
        summary: 'Cập nhật thông tin client',
        description: 'Cập nhật một hoặc nhiều field của client. Yêu cầu quyền `client.write`.',
    })
    @ApiParam({ name: 'id', description: 'UUID của client cần cập nhật', example: 'uuid-of-client' })
    @ApiBody({ type: UpdateClientDto })
    @ApiResponse({ status: 200, description: 'Client đã được cập nhật' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 403, type: ForbiddenResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async updateClient(
        @Req() request: Request,
        @Param('id') id: string,
        @Body() dto: UpdateClientDto
    ) {
        const user: TokenPayload = request['user']
        return this.clientService.update(user.sub, id, dto)
    }
}
