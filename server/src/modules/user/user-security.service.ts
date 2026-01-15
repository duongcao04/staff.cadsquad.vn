import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { SecurityLogStatus } from '../../generated/prisma'
import { plainToInstance } from 'class-transformer'
import { SecurityLogResponseDto } from './dto/security-log/security-log-response.dto'
import { CreateSecurityLogDto } from './dto/security-log/create-security-log.dto'

@Injectable()
export class UserSecurityService {
    constructor(private readonly prisma: PrismaService) {}

    async createLog(dto: CreateSecurityLogDto) {
        return this.prisma.userSecurityLog.create({
            data: {
                userId: dto.userId,
                event: dto.event,
                // Sử dụng toán tử nullish coalescing để set mặc định
                status: dto.status ?? SecurityLogStatus.SUCCESS,
                ipAddress: dto.ipAddress,
                userAgent: dto.userAgent,
            },
        })
    }

    async getSecurityLogs(userId: string, limit: number) {
        const logs = await this.prisma.userSecurityLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            select: {
                id: true,
                event: true,
                status: true,
                ipAddress: true,
                createdAt: true,
            },
        })

        // Format lại dữ liệu khớp với giao diện yêu cầu
        return plainToInstance(SecurityLogResponseDto, logs, {
            excludeExtraneousValues: true,
        })
    }

    // Helper để mask IP (ví dụ: 115.79.x.x) như trong ảnh bạn gửi
    private maskIpAddress(ip: string | null): string {
        if (!ip) return 'Unknown'
        const parts = ip.split('.')
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.x.x`
        }
        return ip
    }
}
