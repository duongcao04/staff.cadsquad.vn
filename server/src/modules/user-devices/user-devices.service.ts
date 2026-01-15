import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { CreateUserDeviceDto } from '../user-devices/dto/create-user-device.dto'

@Injectable()
export class UserDevicesService {
    constructor(private prisma: PrismaService) {}

    /**
     * Đăng ký hoặc cập nhật Device Token
     */
    async registerDevice(userId: string, dto: CreateUserDeviceDto) {
        // Chúng ta tìm kiếm thiết bị dựa trên userId và type (ví dụ: 'WEB_BROWSER')
        const existingDevice = await this.prisma.userDevices.findFirst({
            where: {
                userId: userId,
                type: dto.type,
            },
        })

        if (existingDevice) {
            // Nếu đã có thiết bị loại này cho User này, cập nhật Token mới nhất
            return this.prisma.userDevices.update({
                where: { id: existingDevice.id },
                data: {
                    value: dto.token,
                    status: true, // Đảm bảo status luôn bật khi reload/login
                },
            })
        }

        // Nếu chưa có (ví dụ: User đăng nhập trên thiết bị mới hoàn toàn), tạo mới
        return this.prisma.userDevices.create({
            data: {
                userId: userId,
                value: dto.token,
                type: dto.type,
                status: true,
            },
        })
    }

    /**
     * Vô hiệu hóa thiết bị (khi người dùng logout)
     */
    async logoutDevice(token: string) {
        const device = await this.prisma.userDevices.findFirst({
            where: { value: token },
        })

        if (!device) return

        return this.prisma.userDevices.update({
            where: { id: device.id },
            data: { status: false },
        })
    }

    /**
     * Lấy danh sách các token đang hoạt động của một User
     */
    async getActiveTokens(userId: string): Promise<string[]> {
        const devices = await this.prisma.userDevices.findMany({
            where: {
                userId: userId,
                status: true,
            },
            select: { value: true },
        })

        return devices.map((d) => d.value)
    }

    /**
     * Xóa thiết bị khỏi hệ thống
     */
    async removeDevice(id: string) {
        return this.prisma.userDevices.delete({
            where: { id },
        })
    }
}
