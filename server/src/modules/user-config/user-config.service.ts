import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserConfig, UserConfigGroupEnum } from '../../generated/prisma';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-user-config.dto';
import { EUserConfigCode } from './enums/user-config-code.enum';
import { APP_PERMISSIONS, DEFAULT_JOB_COLUMNS } from '../../utils';

@Injectable()
export class UserConfigService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, data: CreateConfigDto): Promise<UserConfig> {
        const existingConfig = await this.prisma.userConfig.findFirst({
            where: { code: data.code, userId },
        });

        if (existingConfig) {
            throw new ConflictException('Config code already exists');
        }

        return await this.prisma.userConfig.create({
            data: {
                userId,
                code: data.code,
                displayName: data.displayName,
                value: data.value,
            },
        });
    }

    async getPinnedJobIds(userId: string): Promise<string[]> {
        const config = await this.prisma.userConfig.findUnique({
            where: {
                userId_code: {
                    userId,
                    code: EUserConfigCode.PINNED_JOBS,
                },
            },
        });

        return (config?.value as string[]) || [];
    }

    async togglePinJob(userId: string, jobId: string) {
        const code = EUserConfigCode.PINNED_JOBS;

        const config = await this.prisma.userConfig.findUnique({
            where: {
                userId_code: { userId, code },
            },
        });

        let currentIds: string[] = (config?.value as string[]) || [];
        const isPinned = currentIds.includes(jobId);

        if (isPinned) {
            currentIds = currentIds.filter((id) => id !== jobId);
        } else {
            currentIds = [...new Set([...currentIds, jobId])];
        }

        await this.prisma.userConfig.upsert({
            where: {
                userId_code: { userId, code },
            },
            create: {
                userId,
                code,
                value: currentIds,
                displayName: 'List of pinned jobs',
                group: UserConfigGroupEnum.USER,
            },
            update: {
                value: currentIds,
            },
        });

        return {
            success: true,
            isPinned: !isPinned,
            totalPinned: currentIds.length,
        };
    }

    async getSystemJobColumns(userPermissions: string[]) {
        const code = EUserConfigCode.JOB_SHOW_COLUMNS;

        // 1. Lấy Config toàn hệ thống (userId = null)
        let config = await this.prisma.userConfig.findFirst({
            where: { code, userId: null },
        });

        // 2. Nếu chưa có -> TẠO MỚI (Lazy Init)
        if (!config) {
            config = await this.prisma.userConfig.create({
                data: {
                    code,
                    userId: null,
                    value: DEFAULT_JOB_COLUMNS,
                    displayName: 'Cấu hình cột Job mặc định',
                    group: UserConfigGroupEnum.SYSTEM,
                },
            });
        }

        // 3. Clone default columns
        let availableColumns = [...DEFAULT_JOB_COLUMNS];

        // 4. Lọc bỏ cột dựa theo permissions bị thiếu
        if (!userPermissions.includes(APP_PERMISSIONS.JOB.READ_INCOME)) {
            availableColumns = availableColumns.filter((col) => {
                const key = typeof col === 'string' ? col : col.key;
                return key !== 'incomeCost';
            });
        }

        if (!userPermissions.includes(APP_PERMISSIONS.JOB.READ_STAFF_COST)) {
            availableColumns = availableColumns.filter((col) => {
                const key = typeof col === 'string' ? col : col.key;
                return key !== 'staffCost';
            });
        }

        return availableColumns;
    }

    async findAll(userId: string): Promise<UserConfig[]> {
        return this.prisma.userConfig.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(userId: string, configId: string): Promise<UserConfig> {
        const config = await this.prisma.userConfig.findUnique({
            where: { id: configId, userId },
        });
        if (!config) throw new NotFoundException('Config not found');
        return config;
    }

    // Fixed: Updates strictly by config ID
    async update(
        userId: string,
        configId: string,
        data: UpdateConfigDto
    ): Promise<UserConfig> {
        // Will throw NotFoundException if it doesn't exist
        await this.findById(userId, configId);

        return this.prisma.userConfig.update({
            where: { id: configId },
            data,
        });
    }

    // Fixed: Uses Prisma Upsert instead of redundant find/create/update queries
    async updateByCode(
        userId: string,
        code: string,
        data: UpdateConfigDto
    ): Promise<UserConfig> {
        return this.prisma.userConfig.upsert({
            where: {
                userId_code: { userId, code },
            },
            update: data,
            create: {
                userId,
                code,
                displayName: data.displayName ?? '',
                value: data.value ?? '',
            },
        });
    }

    async delete(userId: string, configId: string): Promise<UserConfig> {
        await this.findById(userId, configId);
        return this.prisma.userConfig.delete({ where: { id: configId } });
    }

    async findByCode(userId: string, code: string): Promise<UserConfig | null> {
        return this.prisma.userConfig.findUnique({
            where: { userId_code: { userId, code } },
        });
    }
}