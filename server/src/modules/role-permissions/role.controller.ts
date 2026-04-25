import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { JwtGuard } from '../auth/jwt.guard'
import { CreateRoleDto } from './dtos/create-role.dto'
import { PermissionService } from './permission.service'
import { RoleService } from './role.service'
import { isUUID } from 'class-validator'
import { ApiOperation } from '@nestjs/swagger'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { APP_PERMISSIONS } from '../../utils'

@Controller('roles')
@UseGuards(JwtGuard) // Protect all routes
export class RoleController {
	constructor(
		private readonly roleService: RoleService,
		private readonly permissionService: PermissionService
	) {}

	@Get('permissions')
	allPermissions() {
		return this.permissionService.findAll()
	}

	@Get(':identify')
	findRoleDetail(@Param('identify') identify: string) {
		if (isUUID(identify)) {
			return this.roleService.findById(identify)
		}
		return this.roleService.findByCode(identify)
	}

	@Patch(':id/permissions/bulk')
	@UseGuards(PermissionsGuard)
	@RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
	async toggleRolePermission(
		@Param('id') roleId: string,
		@Body('permissionIds') permissionIds: string[]
	) {
		return this.roleService.updatePermissions(roleId, permissionIds)
	}

	// Get structure for UI (e.g., Checkbox groups)
	@Get('permissions/grouped')
	getPermissions() {
		return this.permissionService.findAllGrouped()
	}

	@Post()
	@UseGuards(PermissionsGuard)
	@RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
	create(@Body() createRoleDto: CreateRoleDto) {
		return this.roleService.create(createRoleDto)
	}

	@Get()
	findAll() {
		return this.roleService.findAll()
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: string) {
		return this.roleService.findById(id)
	}

	@Post(':roleId/members/:userId')
	@ApiOperation({ summary: 'Add a user to a specific role' })
	@ResponseMessage('User added to role successfully')
	@UseGuards(PermissionsGuard)
	@RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
	async addMember(
		@Param('roleId') roleId: string,
		@Param('userId') userId: string
	) {
		return this.roleService.addMember(userId, roleId)
	}

	@Delete('members/:userId')
	@UseGuards(PermissionsGuard)
	@RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
	@ApiOperation({ summary: 'Remove a user from their current role' })
	async removeMember(@Param('userId') userId: string) {
		return this.roleService.removeMember(userId)
	}

	// @Patch(':id')
	// @RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
	// update(
	//     @Param('id', ParseIntPipe) id: string,
	//     @Body() updateRoleDto: UpdateRoleDto
	// ) {
	//     return this.roleService.update(id, updateRoleDto)
	// }

	@Delete(':id')
	@UseGuards(PermissionsGuard)
	@RequirePermissions([APP_PERMISSIONS.ROLE.MANAGE])
	remove(@Param('id', ParseIntPipe) id: string) {
		return this.roleService.remove(id)
	}
}
