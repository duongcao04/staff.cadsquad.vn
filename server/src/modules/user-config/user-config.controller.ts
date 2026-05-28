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
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { BadRequestResponseDto, NotFoundResponseDto, UnauthorizedResponseDto } from '../../common/swagger/api-response.dto'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateConfigDto } from './dto/create-config.dto'
import { UpdateConfigDto } from './dto/update-user-config.dto'
import { UserConfigResponseDto } from './dto/user-config-response.dto'
import { UserConfigService } from './user-config.service'

@ApiTags('Configs')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('config')
export class UserConfigController {
    constructor(private readonly configService: UserConfigService) {}

    @Post()
    @HttpCode(201)
    @ResponseMessage('Config created successfully')
    @ApiOperation({
        summary: 'Tạo config mới cho user',
        description:
            'Tạo một bản ghi cấu hình cá nhân. Mỗi config có `code` định danh duy nhất theo user.',
    })
    @ApiBody({ type: CreateConfigDto })
    @ApiResponse({ status: 201, description: 'Config đã được tạo', type: UserConfigResponseDto })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    create(@Req() request: Request, @Body() dto: CreateConfigDto) {
        const userPayload: TokenPayload = request['user']
        return this.configService.create(userPayload.sub, dto)
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of configs successfully')
    @ApiOperation({
        summary: 'Lấy tất cả configs của user hiện tại',
        description: 'Trả về toàn bộ cấu hình cá nhân (UI preferences, filters đã lưu, ...) của user đang đăng nhập.',
    })
    @ApiResponse({ status: 200, description: 'Danh sách configs', type: [UserConfigResponseDto] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    findAll(@Req() request: Request) {
        const userPayload: TokenPayload = request['user']
        return this.configService.findAll(userPayload.sub)
    }

    @Get('job-columns')
    @HttpCode(200)
    @ResponseMessage('Get columns successfully')
    @ApiOperation({
        summary: 'Lấy cấu hình cột bảng Job',
        description:
            'Trả về danh sách cột hiển thị trong bảng Job dành cho user, dựa theo quyền hạn của họ.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách cột bảng Job',
        schema: {
            example: {
                result: [
                    { key: 'no', label: 'Mã Job', visible: true },
                    { key: 'status', label: 'Trạng thái', visible: true },
                    { key: 'incomeCost', label: 'Doanh thu', visible: false },
                ],
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getColumns(@Req() request: Request) {
        const userPayload: TokenPayload = await request['user']
        return this.configService.getSystemJobColumns(userPayload.permissions)
    }

    @Get(':code')
    @HttpCode(200)
    @ResponseMessage('Get config detail successfully')
    @ApiOperation({
        summary: 'Lấy một config theo code',
        description: 'Trả về config của user hiện tại theo `code` định danh (VD: job-table-columns).',
    })
    @ApiParam({ name: 'code', description: 'Code định danh config', example: 'job-table-columns' })
    @ApiResponse({ status: 200, description: 'Chi tiết config', type: UserConfigResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    findOne(@Req() request: Request, @Param('code') code: string) {
        const userPayload: TokenPayload = request['user']
        return this.configService.findByCode(userPayload.sub, code)
    }

    @Post(':id/toggle-pin')
    @HttpCode(200)
    @ResponseMessage('Toggle pinned job successfully')
    @ApiOperation({
        summary: 'Ghim/bỏ ghim job',
        description: 'Thêm hoặc xóa jobId khỏi danh sách job đã ghim của user. Toggle — nếu đã ghim thì bỏ, chưa ghim thì thêm.',
    })
    @ApiParam({ name: 'id', description: 'UUID của job cần toggle pin', example: 'uuid-of-job' })
    @ApiResponse({ status: 200, description: 'Trạng thái ghim đã được cập nhật' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async togglePin(@Req() request: Request, @Param('id') jobId: string) {
        const userPayload: TokenPayload = await request['user']
        return this.configService.togglePinJob(userPayload.sub, jobId)
    }

    @Patch(':code')
    @HttpCode(200)
    @ResponseMessage('Update config successfully')
    @ApiOperation({
        summary: 'Cập nhật config theo code (deprecated — dùng /code/:code)',
        description: 'Cập nhật giá trị config theo `code`. Endpoint này sẽ bị thay thế bởi `PATCH /config/code/:code`.',
    })
    @ApiParam({ name: 'code', description: 'Code định danh config', example: 'job-table-columns' })
    @ApiBody({ type: UpdateConfigDto })
    @ApiResponse({ status: 200, description: 'Config đã được cập nhật', type: UserConfigResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    update(
        @Req() request: Request,
        @Param('code') code: string,
        @Body() dto: UpdateConfigDto
    ) {
        const userPayload: TokenPayload = request['user']
        return this.configService.update(userPayload.sub, code, dto)
    }

    @Patch('code/:code')
    @HttpCode(200)
    @ResponseMessage('Update config by code successfully')
    @ApiOperation({
        summary: 'Cập nhật config theo code',
        description: 'Cập nhật một config cụ thể theo `code`. Chỉ truyền các field cần thay đổi.',
    })
    @ApiParam({ name: 'code', description: 'Code định danh config', example: 'job-table-columns' })
    @ApiBody({ type: UpdateConfigDto })
    @ApiResponse({ status: 200, description: 'Config đã được cập nhật', type: UserConfigResponseDto })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    updateByCode(
        @Req() request: Request,
        @Param('code') code: string,
        @Body() dto: UpdateConfigDto
    ) {
        const userPayload: TokenPayload = request['user']
        return this.configService.updateByCode(userPayload.sub, code, dto)
    }

    @Delete(':id')
    @HttpCode(200)
    @ResponseMessage('Delete config successfully')
    @ApiOperation({
        summary: 'Xóa config theo ID',
        description: 'Xóa vĩnh viễn config của user theo UUID.',
    })
    @ApiParam({ name: 'id', description: 'UUID của config cần xóa', example: 'uuid-of-config' })
    @ApiResponse({ status: 200, description: 'Config đã được xóa' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    remove(@Req() request: Request, @Param('id') id: string) {
        const userPayload: TokenPayload = request['user']
        return this.configService.delete(userPayload.sub, id)
    }
}
