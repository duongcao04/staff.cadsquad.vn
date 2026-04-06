import {
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'

@Injectable()
export class UserHelperService {
	constructor(
		private readonly prismaService: PrismaService,
	) { }

	async existingEmail(email: string) {
		return await this.prismaService.user.findUnique({
			where: {
				email,
			},
		})
	}

	async isUsernameTaken(username: string): Promise<boolean> {
		const count = await this.prismaService.user.count({
			where: {
				username: {
					equals: username,
					mode: 'insensitive', // Không phân biệt hoa thường (VD: 'John' và 'john' là một)
				},
			},
		})

		return count > 0
	}

	async userPermissions(userId: string): Promise<string[]> {
		const permissions = await this.prismaService.user.findUnique({
			where: { id: userId },
			select: { role: { include: { permissions: true } } },
		})
		const mapPermissions =
			permissions?.role?.permissions.map((it) => it.entityAction) ?? []
		if (mapPermissions.length === 0) {
			throw new NotFoundException('User not have any permissions')
		}
		return mapPermissions
	}

	/**
	 * Input: ch.duong@cadsquad.vn -> Output: ch.duong
	 * Nếu ch.duong đã tồn tại -> Output: ch.duong.a1b2
	 */
	async generateUsernameFromEmail(email: string): Promise<string> {
		// 1. Tách phần prefix từ email (Lấy phần trước dấu @)
		// Ví dụ: ch.duong@cadsquad.vn -> ch.duong
		const baseUsername = email.split('@')[0].toLowerCase()

		// 2. Kiểm tra sự tồn tại trong Database
		const existingUser = await this.prismaService.user.findUnique({
			where: { username: baseUsername },
			select: { id: true },
		})

		// 3. Nếu chưa tồn tại, dùng luôn baseUsername
		if (!existingUser) {
			return baseUsername
		}

		// 4. Nếu đã tồn tại, tạo hậu tố ngẫu nhiên (4 ký tự)
		// Kết quả: ch.duong.x8k2
		const shortId = Math.random().toString(36).substring(2, 6)
		const finalUsername = `${baseUsername}.${shortId}`

		return finalUsername
	}

	/**
	 * Tạo URL avatar từ tên hiển thị
	 * @param name Ví dụ: "Ho Thien My"
	 * @returns https://ui-avatars.com/api/?name=Ho+Thien+My&background=random
	 */
	generateAvatar(name: string): string {
		// 1. Loại bỏ các khoảng trắng thừa
		const cleanName = name.trim()

		// 2. Thay thế khoảng trắng bằng dấu "+" để đúng định dạng URL query
		const formattedName = cleanName.replace(/\s+/g, '+')

		// 3. Trả về URL hoàn chỉnh
		return `https://ui-avatars.com/api/?name=${formattedName}&background=random&size=128`
	}

	async generateStaffCode() {
		const result = await this.prismaService.user.findMany({
			orderBy: {
				code: "asc"
			}
		}).then(res => {
			const arr = [...res] as Array<any>
			const userNum = arr.at(-1).code.slice(-3)
			return String(Number(userNum) + 1).padStart(3, '0')
		})

		return "ST" + result
	}

	async getAccountDefaultRole() {
		const result = await this.prismaService.role.findUnique({
			where: { code: 'staff' },
		})
		return result?.id
	}
}
