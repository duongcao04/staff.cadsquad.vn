import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { UserConfig, UserConfigGroupEnum } from '../../generated/prisma'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { CreateConfigDto } from './dto/create-config.dto'
import { UpdateConfigDto } from './dto/update-user-config.dto'
import { EUserConfigCode } from './enums/user-config-code.enum'
import { DEFAULT_JOB_COLUMNS } from '../../utils'

@Injectable()
export class UserConfigService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, data: CreateConfigDto): Promise<UserConfig> {
        const existingConfig = await this.prisma.userConfig.findFirst({
            where: { code: data.code, userId },
        })
        if (existingConfig) {
            throw new ConflictException('Config code already exist')
        }
        return await this.prisma.userConfig.create({
            data: {
                userId,
                code: data.code,
                displayName: data.displayName,
                value: data.value,
            },
        })
    }

    async getPinnedJobIds(userId: string): Promise<string[]> {
        const config = await this.prisma.userConfig.findUnique({
            where: {
                userId_code: {
                    userId,
                    code: EUserConfigCode.PINNED_JOBS,
                },
            },
        })

        // Ép kiểu Json về mảng number, nếu null trả về rỗng
        return (config?.value as string[]) || []
    }

    async togglePinJob(userId: string, jobId: string) {
        const code = 'PINNED_JOBS' // Nên dùng Enum: ConfigCode.PINNED_JOBS

        // BƯỚC 1: Lấy config hiện tại của user
        const config = await this.prisma.userConfig.findUnique({
            where: {
                userId_code: {
                    userId,
                    code,
                },
            },
        })

        // BƯỚC 2: Parse dữ liệu cũ
        // Ép kiểu Json về mảng number. Nếu null hoặc chưa có thì khởi tạo mảng rỗng []
        let currentIds: string[] = (config?.value as string[]) || []

        // BƯỚC 3: Xử lý Logic Toggle
        const isPinned = currentIds.includes(jobId)

        if (isPinned) {
            // -- UNPIN: Nếu đã tồn tại -> Lọc bỏ ID đó ra khỏi mảng
            currentIds = currentIds.filter((id) => id !== jobId)
        } else {
            // -- PIN: Nếu chưa tồn tại -> Thêm vào mảng
            // Dùng Set để đảm bảo tính duy nhất (tránh duplicate ID)
            currentIds = [...new Set([...currentIds, jobId])]
        }

        // BƯỚC 4: Lưu vào Database (Upsert: Có thì update, chưa thì tạo mới)
        const result = await this.prisma.userConfig.upsert({
            where: {
                userId_code: {
                    userId,
                    code,
                },
            },
            create: {
                userId,
                code,
                value: currentIds,
                displayName: 'List of pinned job',
                group: UserConfigGroupEnum.USER,
            },
            update: {
                value: currentIds,
            },
        })

        // BƯỚC 5: Trả về trạng thái mới để Frontend cập nhật UI
        // !isPinned nghĩa là: Lúc đầu là True (có pin) -> giờ xóa đi -> trả về False (đã bỏ pin) và ngược lại.
        return {
            success: true,
            isPinned: !isPinned, // Trạng thái mới của Job này
            totalPinned: currentIds.length, // Tổng số lượng pin hiện tại
        }
    }

    async getSystemJobColumns(userPermissions: string[]) {
        const code = EUserConfigCode.JOB_SHOW_COLUMNS
        // 1. Lấy Config toàn hệ thống (userId = null)
        let config = await this.prisma.userConfig.findFirst({
            where: {
                code: code,
                userId: null,
            },
        })

        // 2. Nếu chưa có -> TẠO MỚI (Lazy Init)
        if (!config) {
            config = await this.prisma.userConfig.create({
                data: {
                    code: code,
                    userId: null, // Global config
                    value: DEFAULT_JOB_COLUMNS, // Lưu mảng mặc định vào Json
                    displayName: 'Cấu hình cột Job mặc định',
                    group: UserConfigGroupEnum.SYSTEM,
                },
            })
        }

        // 3. Nếu là Admin, trả về toàn bộ (Full quyền)
        // Lưu ý: Thay 'ADMIN' bằng enum role thực tế trong dự án của bạn
        if (userPermissions.includes('job.readSensitive')) {
            return DEFAULT_JOB_COLUMNS
        }

        // 4. Nếu KHÔNG phải Admin, lọc bỏ 'incomeCost'
        return DEFAULT_JOB_COLUMNS.filter((col) => {
            // Xử lý trường hợp col là String ('incomeCost') hoặc Object ({ key: 'incomeCost' })
            const key = typeof col === 'string' ? col : col.key

            return key !== 'incomeCost'
        })
    }

    async findAll(userId: string): Promise<UserConfig[]> {
        return this.prisma.userConfig.findMany({
            where: {
                userId: userId,
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    async findById(userId: string, configId: string): Promise<UserConfig> {
        const config = await this.prisma.userConfig.findUnique({
            where: { id: configId, userId },
        })
        if (!config) throw new NotFoundException('Config not found')
        return config
    }

    async update(
        userId: string,
        code: string,
        data: UpdateConfigDto
    ): Promise<UserConfig> {
        // 1. Find exist config
        const existConfig = await this.findById(userId, code)

        // 2. If exist -> update
        // If not -> create one
        if (existConfig) {
            return this.prisma.userConfig.update({
                where: { id: existConfig.id },
                data,
            })
        } else {
            return this.prisma.userConfig.create({
                data: {
                    code,
                    displayName: data.displayName ?? '',
                    value: data.value ?? '',
                    userId: userId,
                },
            })
        }
    }

    async updateByCode(
        userId: string,
        code: string,
        data: UpdateConfigDto
    ): Promise<UserConfig> {
        const existConfig = await this.prisma.userConfig.findFirst({
            where: {
                userId,
                code,
            },
        })
        if (!existConfig) {
            await this.prisma.userConfig.create({
                data: {
                    code,
                    displayName: data.displayName ?? '',
                    value: data.value ?? '',
                    userId: userId,
                },
            })
        }
        return this.prisma.userConfig.update({
            where: {
                userId_code: {
                    userId,
                    code,
                },
            },
            data,
        })
    }

    async delete(userId: string, configId: string): Promise<UserConfig> {
        await this.findById(userId, configId)
        return this.prisma.userConfig.delete({ where: { id: configId } })
    }

    async findByCode(userId: string, code: string): Promise<UserConfig | null> {
        return this.prisma.userConfig.findUnique({
            where: { userId_code: { userId, code } },
        })
    }
}
