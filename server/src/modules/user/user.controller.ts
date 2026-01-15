import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger'
import { isUUID } from 'class-validator'
import { BypassTransform } from '../../common/decorators/bypass.decorator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { APP_PERMISSIONS } from '../../utils/_app-permissions'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { AssignUserPermissionDto } from './dto/assign-user-permission.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { ProtectUserResponseDto } from './dto/protect-user-response.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserQueryDto } from './dto/user-query.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { UserSecurityService } from './user-security.service'
import { UserService } from './user.service'

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly userSecurityService: UserSecurityService
	) {}

	@Get('search')
	@HttpCode(200)
	@ResponseMessage('Search user successfully')
	async search(@Query('q') query: string) {
		if (!query) return []
		return this.userService.search(query)
	}

	@Get('schedule')
	@HttpCode(200)
	@ResponseMessage('Get profile schedules successfully')
	async schedule(
		@Req() request: Request,
		@Query('day') day: number,
		@Query('month') month: number,
		@Query('year') year: number
	) {
		const userPayload: TokenPayload = await request['user']
		if (!month && !year) return []
		return this.userService.getUserSchedule(
			userPayload.sub,
			month,
			year,
			day
		)
	}

	@Post()
	@HttpCode(201)
	@ResponseMessage('Create user successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create a new user' })
	@ApiResponse({
		status: 201,
		description: 'The user has been successfully created.',
		type: UserResponseDto,
	})
	async create(
		@Body() createUserDto: CreateUserDto,
		@Query() sendInviteEmail: '0' | '1'
	) {
		const isSendInviteEmail = Boolean(sendInviteEmail)
		return this.userService.create(createUserDto, isSendInviteEmail)
	}

	@Get('security-logs')
	@ApiOperation({ summary: 'Get recent security activities' })
	async getRecentActivity(
		@Req() request: Request,
		@Query('limit') limit: number = 10
	) {
		const userPayload: TokenPayload = await request['user']
		return this.userSecurityService.getSecurityLogs(userPayload.sub, limit)
	}

	@Get()
	@HttpCode(200)
	@ResponseMessage('Get list of users successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all users' })
	@ApiResponse({
		status: 200,
		description: 'Return a list of users.',
		type: [ProtectUserResponseDto],
	})
	async findAll(@Query() query: UserQueryDto) {
		return this.userService.findAll(query)
	}

	@Post(':id/permissions')
	@UseGuards(PermissionsGuard)
	@RequirePermissions('user.update')
	async managePermission(
		@Param('id', ParseUUIDPipe) userId: string,
		@Body() dto: AssignUserPermissionDto
	) {
		return this.userService.manageUserPermission(userId, dto)
	}

	@Patch('update-password')
	@HttpCode(200)
	@ApiBearerAuth()
	@ResponseMessage('Update password successfully')
	@ApiOperation({ summary: 'Update the password for the current user' })
	@ApiResponse({
		status: 200,
		description: 'The password has been successfully updated.',
	})
	async updatePassword(
		@Req() request: Request,
		@Body() dto: UpdatePasswordDto
	) {
		const userPayload: TokenPayload = await request['user']
		return this.userService.updatePassword(userPayload.sub, dto)
	}

	@Patch(':id/reset-password')
	@HttpCode(200)
	@ResponseMessage('Reset password successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Reset the password for a user' })
	@ApiResponse({
		status: 200,
		description: 'The password has been successfully reset.',
	})
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.USER.RESET_PASSWORD)
	async resetPassword(
		@Param('id') id: string,
		@Body() dto: ResetPasswordDto
	) {
		return this.userService.resetPassword(id, dto)
	}

	@Get('check-username')
	@HttpCode(200)
	@ResponseMessage('Check username successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Check if a username is valid' })
	@ApiResponse({
		status: 200,
		description: 'Returns a boolean indicating if the username is valid.',
	})
	async checkUsernameTaken(@Query('username') username: string) {
		const isExist = await this.userService.isUsernameTaken(username)
		return { isExist }
	}

	// Handles both ID and Username
	@Get(':identifier')
	@HttpCode(200)
	@ResponseMessage('Get user detail successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get a user by ID or Username' })
	@ApiResponse({
		status: 200,
		description: 'Return a single user.',
		type: UserResponseDto,
	})
	async findOne(@Param('identifier') identifier: string) {
		// Check if the parameter looks like a UUID
		if (isUUID(identifier)) {
			return this.userService.findById(identifier)
		}
		// Otherwise treat it as a username
		return this.userService.findByUsername(identifier)
	}

	@Patch(':username')
	@HttpCode(200)
	@ResponseMessage('Update user successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update a user' })
	@ApiResponse({
		status: 200,
		description: 'The user has been successfully updated.',
		type: UserResponseDto,
	})
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.USER.UPDATE)
	async update(
		@Param('username') username: string,
		@Body() updateUserDto: UpdateUserDto
	) {
		return this.userService.update(username, updateUserDto)
	}

	@Patch(':id/assign-role')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(
		APP_PERMISSIONS.ROLE.MANAGE,
		APP_PERMISSIONS.USER.UPDATE
	)
	@ResponseMessage('Assign role for user successfully')
	async assignUserRole(
		@Param('id') id: string,
		@Body('roleId') roleId: string
	) {
		return this.userService.assignRole(id, roleId)
	}

	@Patch(':id/status')
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.USER.BLOCK)
	@ResponseMessage('User status updated successfully')
	async toggleStatus(
		@Param('id') id: string,
		@Req() request: Request,
		@Query('isActive') isActive: string
	) {
		const userPayload: TokenPayload = await request['user']
		return this.userService.toggleUserStatus(userPayload.sub, id, isActive)
	}

	@Delete(':id')
	@HttpCode(204)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete a user' })
	@ApiResponse({
		status: 200,
		description: 'The user has been successfully deleted.',
	})
	@UseGuards(PermissionsGuard)
	@RequirePermissions(APP_PERMISSIONS.USER.DELETE)
	@BypassTransform()
	async remove(@Param('id') id: string) {
		const softDeleted = await this.userService.softDelete(id)
		return {
			success: true,
			message: softDeleted.message,
			timestamp: new Date().toISOString(),
		}
	}
}
