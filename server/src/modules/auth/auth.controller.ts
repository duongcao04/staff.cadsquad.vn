import { ResponseMessage } from '@/common/decorators/responseMessage.decorator'
import {
	ForgotPasswordDto,
	ResetPasswordWithTokenDto,
} from '@/modules/user/dto/forgot-password.dto'
import { UserResponseDto } from '@/modules/user/dto/user-response.dto'
import { UserSecurityService } from '@/modules/user/user-security.service'
import { UserService } from '@/modules/user/user.service'
import {
	Body,
	Controller,
	Delete,
	Get,
	Headers,
	HttpCode,
	HttpStatus,
	Ip,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Req,
	Res,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { LoginUserDto } from './dto/login-user.dto'
import { RegisterUserDto } from './dto/register-user.dto'
import { TokenPayload } from './dto/token-payload.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { JwtGuard } from './jwt.guard'
import { SessionService } from './session.service'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly sessionService: SessionService, // Inject
		private readonly securityService: UserSecurityService // Inject
	) {}
	// New function to validate a token
	@Get('validate-token')
	@HttpCode(200)
	@ResponseMessage('Token is valid')
	@UseGuards(JwtGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Validate JWT token' })
	@ApiResponse({ status: 200, description: 'Token is valid' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async validateToken(@Req() request: Request) {
		return { isValid: 1 }
	}

	@Post('register')
	@HttpCode(201)
	@ResponseMessage('Register successfully')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiResponse({
		status: 201,
		description: 'User registered successfully',
		type: UserResponseDto,
	})
	register(@Body() dto: RegisterUserDto) {
		const register = this.authService.register(dto)
		return register
	}
	@Post('login')
	@HttpCode(200)
	@ResponseMessage('Login successfully')
	@ApiOperation({ summary: 'Log in a user' })
	async login(
		@Ip() ip: string,
		@Headers('user-agent') userAgent: string,
		@Body() dto: LoginUserDto,
		@Res({ passthrough: true }) res: Response
	) {
		// 1. Thực hiện Login logic cũ (Validate user + Generate JWT)
		const loginResult = await this.authService.login(ip, userAgent, dto)

		// Gắn sessionId vào Response Header
		res.setHeader('x-session-id', loginResult.sessionId)
		return {
			accessToken: loginResult.accessToken,
			sessionId: loginResult.sessionId,
		}
	}

	@Get('profile')
	@HttpCode(200)
	@ResponseMessage('Get user profile successfully')
	@UseGuards(JwtGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get the profile of the currently logged-in user',
	})
	@ApiResponse({
		status: 200,
		description: 'Return user profile',
		type: UserResponseDto,
	})
	async getProfile(@Req() request: Request) {
		const userPayload = await request['user']
		const user = this.authService.getProfile(userPayload.sub)
		return user
	}

	@Patch('profile')
	@ApiOperation({ summary: 'Update profile successfully' })
	@ResponseMessage('Update profile successfully')
	@UseGuards(JwtGuard)
	@ApiBearerAuth()
	async updateProfile(
		@Req() request: any,
		@Ip() ip: string,
		@Body() dto: UpdateProfileDto
	) {
		const userPayload: TokenPayload = request.user
		const result = await this.authService.updateProfile(
			userPayload.sub,
			dto
		)

		// Ghi Log khi cập nhật Profile
		await this.securityService.createLog({
			userId: userPayload.sub,
			event: 'Profile Updated',
			status: 'SUCCESS',
			ipAddress: ip,
		})

		return result
	}

	@Get('permissions')
	@HttpCode(200)
	@UseGuards(JwtGuard)
	@ResponseMessage('Get user permissions successfully')
	async getUserPermissions(@Req() request: Request) {
		const userPayload = await request['user']
		const user = this.authService.getEffectivePermissions(userPayload.sub)
		return user
	}
	// --- NEW: Quản lý Active Sessions ---

	@Get('sessions')
	@UseGuards(JwtGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get active sessions from Redis' })
	async getSessions(@Req() request: any) {
		const userPayload: TokenPayload = request.user
		return this.sessionService.getActiveSessions(userPayload.sub)
	}

	/**
	 * 1. Request Password Reset Link
	 * POST /auth/forgot-password
	 */
	@Post('forgot-password')
	@HttpCode(HttpStatus.OK)
	@ResponseMessage('Send email reset password successfully')
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		return this.authService.forgotPassword(dto.email)
	}

	@Post('forgot-password/reset')
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ValidationPipe({ transform: true }))
	async resetPasswordWithToken(@Body() dto: ResetPasswordWithTokenDto) {
		return this.authService.resetPasswordWithToken(
			dto.token,
			dto.newPassword
		)
	}

	@Delete('sessions/all')
	@UseGuards(JwtGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Revoke all active sessions (Logout all devices)',
	})
	@ResponseMessage('Logged out from all devices successfully')
	async revokeAll(@Req() request: any, @Ip() ip: string) {
		const userPayload: TokenPayload = request.user

		// 1. Xóa sạch session trong Redis
		await this.sessionService.revokeAllSessions(userPayload.sub)

		// 2. Ghi Security Log
		await this.securityService.createLog({
			userId: userPayload.sub,
			event: 'All Sessions Revoked',
			status: 'SUCCESS',
			ipAddress: ip,
		})

		return { success: true }
	}

	@Delete('sessions/:sessionId')
	@UseGuards(JwtGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Revoke a specific session (Logout device)' })
	@ResponseMessage('Session revoked successfully')
	async revokeSession(
		@Req() request: Request,
		@Param('sessionId', ParseUUIDPipe) sessionId: string,
		@Ip() ip: string
	) {
		const userPayload: TokenPayload = request['user']
		await this.sessionService.revokeSession(userPayload.sub, sessionId)

		// Ghi Log bảo mật
		await this.securityService.createLog({
			userId: userPayload.sub,
			event: 'Session Revoked / Remote Logout',
			status: 'SUCCESS',
			ipAddress: ip,
		})

		return
	}
}
