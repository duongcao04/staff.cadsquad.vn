import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';

@Injectable()
export class AdminUsersService {
	constructor(private readonly prisma: PrismaService) { }

	async toggleUserStatus(userId: string, isActive: boolean) {
		return this.prisma.user.update({
			where: { id: userId },
			data: { isActive },
			select: { id: true, username: true, isActive: true }
		});
	}

	async forceLogoutAllDevices(userId: string) {
		// Nếu dùng Better Auth hoặc session token trong DB, bạn xóa session ở đây
		await this.prisma.session.deleteMany({
			where: { userId }
		});
		return { message: 'All sessions terminated successfully.' };
	}

	async forceDeleteUser(userId: string) {
		// Xóa cứng hoặc Soft delete tùy logic
		return this.prisma.user.delete({
			where: { id: userId }
		});
	}
}