import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
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
import { plainToInstance } from 'class-transformer'
import { BadRequestResponseDto, NotFoundResponseDto, UnauthorizedResponseDto } from '../../common/swagger/api-response.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateSystemSettingDto } from './dtos/create-system-setting.dto'
import { SystemSettingResponseDto } from './dtos/system-setting-response.dto'
import { SystemSettingsService } from './system-settings.service'

@ApiTags('System Settings')
@ApiBearerAuth()
@Controller('system-settings')
@UseGuards(JwtGuard)
export class SystemSettingsController {
    constructor(private readonly settingsService: SystemSettingsService) {}

    @Post()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Tạo hoặc cập nhật một system setting',
        description:
            'Upsert setting theo `key`. Nếu key đã tồn tại → cập nhật `value`. Nếu chưa → tạo mới. Chỉ Admin được phép dùng.',
    })
    @ApiBody({ type: CreateSystemSettingDto })
    @ApiResponse({
        status: 200,
        description: 'Setting đã được lưu',
        type: SystemSettingResponseDto,
    })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updateSetting(
        @Body() dto: CreateSystemSettingDto,
        @Body('userId') userId: string
    ) {
        const setting = await this.settingsService.upsertSetting(dto, userId)
        return plainToInstance(SystemSettingResponseDto, setting, { excludeExtraneousValues: true })
    }

    @Get(':key')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy một system setting theo key',
        description: 'Trả về giá trị setting theo `key` định danh.',
    })
    @ApiParam({ name: 'key', description: 'Key của setting cần lấy', example: 'company_name' })
    @ApiResponse({ status: 200, description: 'Setting tương ứng', type: SystemSettingResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async getOne(@Param('key') key: string) {
        const setting = await this.settingsService.getSetting(key)
        return plainToInstance(SystemSettingResponseDto, setting, { excludeExtraneousValues: true })
    }

    @Get()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy tất cả system settings',
        description: 'Trả về toàn bộ cấu hình hệ thống dạng key-value. Chỉ Admin được phép xem.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách tất cả settings',
        type: [SystemSettingResponseDto],
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAll() {
        const settings = await this.settingsService.getAllSettings()
        return plainToInstance(SystemSettingResponseDto, settings, { excludeExtraneousValues: true })
    }
}
