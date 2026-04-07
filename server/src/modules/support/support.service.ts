import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { CreateTicketDto } from './dtos/create-ticket.dto'
import { SupportTicket } from '../../generated/prisma'
import { UpdateTicketDto } from './dtos/update-ticket.dto'

@Injectable()
export class SupportService {
	constructor(private prisma: PrismaService) {}

	async createTicket(
		userId: string,
		dto: CreateTicketDto
	): Promise<SupportTicket> {
		return this.prisma.supportTicket.create({
			data: {
				...dto,
				userId,
			},
		})
	}

	async findAllByUser(userId: string): Promise<SupportTicket[]> {
		return this.prisma.supportTicket.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		})
	}

	async update(
		userId: string,
		ticketId: string,
		dto: UpdateTicketDto
	): Promise<SupportTicket> {
		return this.prisma.supportTicket.update({
			where: { id: ticketId },
			data: {
				...dto,
				userId,
			},
		})
	}
}

