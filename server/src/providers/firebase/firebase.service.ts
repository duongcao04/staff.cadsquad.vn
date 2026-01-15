import { Inject, Injectable, Logger } from '@nestjs/common'
import * as admin from 'firebase-admin'
import { PrismaService } from '../../providers/prisma/prisma.service'

@Injectable()
export class FirebaseService {
    private readonly logger = new Logger(FirebaseService.name)

    constructor(
        @Inject('FIREBASE_ADMIN') private readonly firebase: admin.app.App,
        private readonly prisma: PrismaService
    ) {}

    /**
     * Gửi thông báo đến danh sách các Token
     * @param tokens Mảng các FCM Token
     * @param payload Nội dung thông báo
     */
    async sendPush(
        tokens: string[],
        payload: {
            title: string
            body: string
            url?: string
            imageUrl?: string
        }
    ) {
        if (!tokens || tokens.length === 0) return

        // Loại bỏ các token trùng lặp
        const uniqueTokens = Array.from(new Set(tokens))

        const message: admin.messaging.MulticastMessage = {
            tokens: uniqueTokens,
            notification: {
                title: payload.title,
                body: payload.body,
                imageUrl: payload.imageUrl,
            },
            // Dữ liệu ngầm để xử lý điều hướng ở Frontend
            data: {
                redirectUrl: payload.url || '/',
                click_action: 'FLUTTER_NOTIFICATION_CLICK', // Cho Mobile nếu cần
            },
            android: {
                priority: 'high', // Bắt buộc để vượt qua Doze Mode
            },
            // Cấu hình riêng cho Web để hiện icon và badge
            webpush: {
                headers: {
                    // Thiết lập mức độ khẩn cấp theo chuẩn WebPush Protocol
                    // Các giá trị: 'very-low', 'low', 'normal', 'high'
                    Urgency: 'high',
                },
                notification: {
                    icon: '/favicon.ico',
                    badge: '/badge.png',
                    title: payload.title,
                    body: payload.body,
                    click_action: payload.url || '/',
                    requireInteraction: true,
                    imageUrl: payload.imageUrl,
                },
                fcmOptions: {
                    // Link điều hướng khi click
                    link: payload.url || '/',
                },
            },
        }

        try {
            const response = await this.firebase
                .messaging()
                .sendEachForMulticast(message)
            this.logger.log(
                `Successfully sent ${response.successCount} push messages.`
            )

            // XỬ LÝ DỌN DẸP TOKEN LỖI
            if (response.failureCount > 0) {
                await this.cleanupInvalidTokens(
                    uniqueTokens,
                    response.responses
                )
            }

            return response
        } catch (error) {
            this.logger.error(`Error sending Firebase push: ${error.message}`)
        }
    }

    /**
     * Tự động xóa hoặc vô hiệu hóa các Token không còn hiệu lực
     */
    private async cleanupInvalidTokens(
        tokens: string[],
        responses: admin.messaging.SendResponse[]
    ) {
        const invalidTokens: string[] = []

        responses.forEach((res, idx) => {
            if (!res.success) {
                const error = res.error
                // Các lỗi cho biết token không còn tồn tại hoặc đã hết hạn
                if (
                    error?.code ===
                        'messaging/registration-token-not-registered' ||
                    error?.code === 'messaging/invalid-registration-token'
                ) {
                    invalidTokens.push(tokens[idx])
                }
            }
        })

        if (invalidTokens.length > 0) {
            this.logger.warn(
                `Deactivating ${invalidTokens.length} invalid tokens.`
            )
            // Chuyển status về false trong bảng UserDevices theo schema của bạn
            await this.prisma.userDevices.updateMany({
                where: { value: { in: invalidTokens } },
                data: { status: false },
            })
        }
    }

    /**
     * Gửi thông báo trực tiếp cho một UserId (Lấy token từ DB)
     */
    async sendToUser(
        userId: string,
        payload: { title: string; body: string; url?: string }
    ) {
        const userDevices = await this.prisma.userDevices.findMany({
            where: { userId, status: true },
            select: { value: true },
        })
        console.log(userId)
        console.log(userDevices)

        const tokens = userDevices.map((d) => d.value)
        return this.sendPush(tokens, payload)
    }
}
