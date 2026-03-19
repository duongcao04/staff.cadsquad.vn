import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';

@Controller('admin/users')
export class AdminUsersController {
	constructor(private readonly adminUsersService: AdminUsersService) { }

	@Patch(':id/status')
	async toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
		return this.adminUsersService.toggleUserStatus(id, isActive);
	}

	@Post(':id/force-logout')
	async forceLogout(@Param('id') id: string) {
		return this.adminUsersService.forceLogoutAllDevices(id);
	}

	@Delete(':id')
	async deleteUser(@Param('id') id: string) {
		return this.adminUsersService.forceDeleteUser(id);
	}
}