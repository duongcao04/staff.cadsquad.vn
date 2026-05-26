import {
    Body,
    Controller,
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
import {
    BadRequestResponseDto,
    NotFoundResponseDto,
    UnauthorizedResponseDto,
} from '../../common/swagger/api-response.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateTicketDto } from './dtos/create-ticket.dto'
import { UpdateTicketDto } from './dtos/update-ticket.dto'
import { SupportService } from './support.service'

@ApiTags('Support')
@ApiBearerAuth()
@Controller('support')
@UseGuards(JwtGuard)
export class SupportController {
    constructor(private readonly supportService: SupportService) {}

    @Post('ticket')
    @HttpCode(201)
    @ResponseMessage('Ticket created successfully')
    @ApiOperation({
        summary: 'Tạo ticket hỗ trợ mới',
        description:
            'Tạo một yêu cầu hỗ trợ mới. Ticket sẽ được gắn vào user đang đăng nhập và chờ xử lý.',
    })
    @ApiBody({ type: CreateTicketDto })
    @ApiResponse({
        status: 201,
        description: 'Ticket đã được tạo',
        schema: {
            example: {
                success: true,
                message: 'Ticket created successfully',
                result: {
                    id: 'uuid',
                    subject: 'Không thể đăng nhập',
                    category: 'TECHNICAL',
                    status: 'OPEN',
                    createdAt: '2026-05-26T07:00:00.000Z',
                },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async create(@Req() req: Request, @Body() dto: CreateTicketDto) {
        const user = req['user']
        return this.supportService.createTicket(user.sub, dto)
    }

    @Patch('ticket/:id')
    @HttpCode(200)
    @ResponseMessage('Ticket updated successfully')
    @ApiOperation({
        summary: 'Cập nhật ticket hỗ trợ',
        description: 'Cập nhật nội dung ticket của user hiện tại. Chỉ chủ ticket hoặc admin mới được phép sửa.',
    })
    @ApiParam({ name: 'id', description: 'UUID của ticket cần cập nhật', example: 'uuid-of-ticket' })
    @ApiBody({ type: UpdateTicketDto })
    @ApiResponse({ status: 200, description: 'Ticket đã được cập nhật' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiResponse({ status: 404, type: NotFoundResponseDto })
    async update(
        @Req() req: Request,
        @Param('id') ticketId: string,
        @Body() dto: UpdateTicketDto
    ) {
        const user = req['user']
        return this.supportService.update(user.sub, ticketId, dto)
    }

    @Get('tickets')
    @HttpCode(200)
    @ResponseMessage('Get tickets successfully')
    @ApiOperation({
        summary: 'Lấy danh sách ticket của user hiện tại',
        description: 'Trả về tất cả ticket hỗ trợ mà user đang đăng nhập đã tạo.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách ticket',
        schema: {
            example: {
                success: true,
                message: 'Get tickets successfully',
                result: [
                    { id: 'uuid', subject: 'Không thể đăng nhập', category: 'TECHNICAL', status: 'OPEN' },
                ],
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async findAll(@Req() req: Request) {
        const user = req['user']
        return this.supportService.findAllByUser(user.sub)
    }
}
