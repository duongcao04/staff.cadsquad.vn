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
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateConfigDto } from './dto/create-config.dto'
import { UpdateConfigDto } from './dto/update-user-config.dto'
import { UserConfigResponseDto } from './dto/user-config-response.dto'
import { UserConfigService } from './user-config.service'

@ApiTags('Configs')
@UseGuards(JwtGuard)
@Controller('config')
export class UserConfigController {
    constructor(private readonly configService: UserConfigService) {}

    @Post()
    @HttpCode(201)
    @ResponseMessage('Config created successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new config' })
    @ApiResponse({
        status: 201,
        description: 'The config has been successfully created.',
        type: UserConfigResponseDto,
    })
    create(@Req() request: Request, @Body() dto: CreateConfigDto) {
        const userPayload: TokenPayload = request['user']
        return this.configService.create(userPayload.sub, dto)
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of configs successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all configs for the current user' })
    @ApiResponse({
        status: 200,
        description: 'Return a list of configs.',
        type: [UserConfigResponseDto],
    })
    findAll(@Req() request: Request) {
        const userPayload: TokenPayload = request['user']
        return this.configService.findAll(userPayload.sub)
    }

    @Get('job-columns')
    @HttpCode(200)
    @ResponseMessage('Get columns successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get job columns for a user' })
    @ApiResponse({ status: 200, description: 'Return a list of columns.' })
    async getColumns(@Req() request: Request) {
        const userPayload: TokenPayload = await request['user']
        return this.configService.getSystemJobColumns(userPayload.permissions)
    }

    @Get(':code')
    @HttpCode(200)
    @ResponseMessage('Get config detail successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a config by its CODE' })
    @ApiResponse({
        status: 200,
        description: 'Return a single config.',
        type: UserConfigResponseDto,
    })
    findOne(@Req() request: Request, @Param('code') code: string) {
        const userPayload: TokenPayload = request['user']
        return this.configService.findByCode(userPayload.sub, code)
    }

    @Post(':id/toggle-pin')
    @HttpCode(200)
    @ResponseMessage('Toggle pinned job successfully')
    @ApiOperation({ summary: 'Toggle pinned job' })
    @ApiBearerAuth()
    async togglePin(@Req() request: Request, @Param('id') jobId: string) {
        const userPayload: TokenPayload = await request['user']
        return this.configService.togglePinJob(userPayload.sub, jobId)
    }

    @Patch(':code')
    @HttpCode(200)
    @ResponseMessage('Update config successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a config by its CODE' })
    @ApiResponse({
        status: 200,
        description: 'The config has been successfully updated.',
        type: UserConfigResponseDto,
    })
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a config by its code' })
    @ApiResponse({
        status: 200,
        description: 'The config has been successfully updated.',
        type: UserConfigResponseDto,
    })
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a config by its ID' })
    @ApiResponse({
        status: 200,
        description: 'The config has been successfully deleted.',
    })
    remove(@Req() request: Request, @Param('id') id: string) {
        const userPayload: TokenPayload = request['user']
        return this.configService.delete(userPayload.sub, id)
    }
}
