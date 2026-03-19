import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { UpdateClientDto } from './dto/update-client.dto'

@Injectable()
export class ClientService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.client.findMany({
            include: {
                _count: {
                    select: { jobs: true }, // Shows how many projects this client has
                },
            },
            orderBy: {
                name: 'asc', // Alphabetical order for the Autocomplete list
            },
        })
    }

    async findByName(name: string) {
        return this.prisma.client.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: 'insensitive', // Chống trùng lặp Apple/apple/APPLE
                },
            },
            include: {
                _count: {
                    select: { jobs: true },
                },
            },
        })
    }

    async findByCode(code: string) {
        return this.prisma.client.findFirst({
            where: {
                code: {
                    equals: code.trim(),
                    mode: 'insensitive', // Chống trùng lặp Apple/apple/APPLE
                },
            },
            include: {
                _count: {
                    select: { jobs: true },
                },
                jobs: {
                    include: {
                        status: {}
                    }
                }
            },
        })
    }

    async findOne(id: string) {
        return this.prisma.client.findUnique({
            where: { id },
            include: {
                jobs: {
                    include: {
                        status: {}
                    }
                }
            },
        })
    }

    async update(modifierId: string, clientId: string, dto: UpdateClientDto) {
        // 1. Verify client exists
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
        })
        if (!client) throw new NotFoundException('Client not found')

        // 2. If name is being changed, check for duplicates (case-insensitive)
        if (
            dto.name &&
            dto.name.trim().toLowerCase() !== client.name.toLowerCase()
        ) {
            const duplicate = await this.prisma.client.findFirst({
                where: {
                    name: {
                        equals: dto.name.trim(),
                        mode: 'insensitive',
                    },
                },
            })
            if (duplicate)
                throw new ConflictException(
                    'A client with this name already exists'
                )
        }

        const updated = await this.prisma.client.update({
            where: { id: clientId },
            data: {
                ...dto,
                name: dto.name?.trim(),
            },
        })
        // 3. Update the client
        return { id: updated.id, name: client.name }
    }
}
