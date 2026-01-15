import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { UAParser } from 'ua-parser-js'
import { REDIS_CLIENT } from '@/providers/redis/redis.provider'
import { SaveSessionDto } from './dto/session/save-session.dto'

@Injectable()
export class SessionService {
	constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

	private getSessionKey(userId: string, sessionId: string) {
		return `session:${userId}:${sessionId}`
	}

	// Lưu session khi login
	async saveSession(userId: string, data: SaveSessionDto) {
		const parser = new UAParser(data.device)
		const uaResult = parser.getResult()
		const sessionId = crypto.randomUUID()
		const key = this.getSessionKey(userId, sessionId)

		// Lưu session data và set TTL 7 ngày
		await this.redis.set(
			key,
			JSON.stringify({
				...data,
				sessionId,
				device: `${uaResult.browser.name || 'Unknown'} on ${uaResult.os.name || 'Unknown'}`,
			}),
			'EX',
			7 * 24 * 60 * 60
		)
		return sessionId
	}

	// Lấy danh sách session để hiển thị trên UI "Active Sessions"
	async getActiveSessions(userId: string) {
		const keys = await this.redis.keys(`session:${userId}:*`)
		if (keys.length === 0) return []

		const pipeline = this.redis.pipeline()
		keys.forEach((key) => pipeline.get(key))
		const results = await pipeline.exec()

		if (!results) return []

		return results
			.map(([err, data]) => {
				if (err || !data) return null // Bỏ qua nếu lỗi hoặc key đã hết hạn
				try {
					return JSON.parse(data as string)
				} catch {
					return null
				}
			})
			.filter((session) => session !== null) // Chỉ giữ lại các session hợp lệ
	}

	// Kiểm tra session còn hiệu lực không
	async isValidSession(userId: string, sessionId: string): Promise<boolean> {
		const key = this.getSessionKey(userId, sessionId)
		const exists = await this.redis.exists(key)

		// Redis EXISTS trả về 1 nếu tồn tại, 0 nếu không
		return exists === 1
	}

	// Thu hồi token (Blacklist)
	async revokeSession(userId: string, sessionId: string) {
		const key = this.getSessionKey(userId, sessionId)
		await this.redis.del(key)
	}

	/**
	 * Thu hồi toàn bộ phiên làm việc của một người dùng
	 */
	async revokeAllSessions(userId: string): Promise<void> {
		const pattern = `session:${userId}:*`
		const keys = await this.redis.keys(pattern)

		if (keys.length > 0) {
			// Sử dụng toán tử spread để xóa tất cả các keys tìm thấy
			await this.redis.del(...keys)
		}
	}

	// Xóa session (Logout hoặc đá thiết bị)
	async deleteSession(userId: string, sessionId: string) {
		await this.redis.del(this.getSessionKey(userId, sessionId))
	}
}
