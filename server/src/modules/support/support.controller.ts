import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateTicketDto } from './dtos/create-ticket.dto'
import { SupportService } from './support.service'
import { UpdateTicketDto } from './dtos/update-ticket.dto'

@Controller('support')
@UseGuards(JwtGuard)
export class SupportController {
	constructor(private readonly supportService: SupportService) {}

	@Post('ticket')
	async create(@Req() req: Request, @Body() dto: CreateTicketDto) {
		const user = req['user']
		return this.supportService.createTicket(user.sub, dto)
	}

	@Patch('ticket/:id')
	async update(
		@Req() req: Request,
		@Param('id') ticketId: string,
		@Body() dto: UpdateTicketDto
	) {
		const user = req['user']
		return this.supportService.update(user.sub, ticketId, dto)
	}

	@Get('tickets')
	async findAll(@Req() req: Request) {
		const user = req['user']
		return this.supportService.findAllByUser(user.sub)
	}
}

