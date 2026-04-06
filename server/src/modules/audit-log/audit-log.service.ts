import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'

@Injectable()
export class AuditLogService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.systemAuditLog.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                actor: {
                    select: {
                        id: true,
                        displayName: true,
                        avatar: true,
                        email: true,
                    },
                },
            },
        })
    }

    async findByTargetId(targetId: string) {
        return this.prisma.systemAuditLog.findMany({
            where: { targetId },
            orderBy: { createdAt: 'desc' },
            include: {
                actor: {
                    select: {
                        id: true,
                        displayName: true,
                        avatar: true,
                        email: true,
                    },
                },
            },
        })
    }

    async findByModule(moduleName: any) {
        return this.prisma.systemAuditLog.findMany({
            where: { module: moduleName },
            orderBy: { createdAt: 'desc' },
            include: {
                actor: {
                    select: {
                        id: true,
                        displayName: true,
                        avatar: true,
                        email: true,
                    },
                },
            },
        })
    }
}
