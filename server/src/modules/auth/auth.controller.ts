import { ResponseMessage } from '@/common/decorators/responseMessage.decorator'
import {
    BadRequestResponseDto,
    UnauthorizedResponseDto,
} from '@/common/swagger/api-response.dto'
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
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { LoginUserDto } from './dto/login-user.dto'
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
        private readonly sessionService: SessionService,
        private readonly securityService: UserSecurityService
    ) {}

    @Get('validate-token')
    @HttpCode(200)
    @ResponseMessage('Token is valid')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Kiểm tra JWT token còn hợp lệ không',
        description:
            'Dùng để frontend ping kiểm tra token trước khi gọi API. Trả về `{ isValid: 1 }` nếu token còn hiệu lực.',
    })
    @ApiResponse({
        status: 200,
        description: 'Token hợp lệ',
        schema: {
            example: {
                success: true,
                message: 'Token is valid',
                result: { isValid: 1 },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto, description: 'Token hết hạn hoặc không hợp lệ' })
    async validateToken(@Req() request: Request) {
        return { isValid: 1 }
    }

    @Post('login')
    @HttpCode(200)
    @ResponseMessage('Login successfully')
    @ApiOperation({
        summary: 'Đăng nhập bằng email & password',
        description:
            'Trả về `accessToken` (JWT) và `sessionId`. Lưu `accessToken` vào header `Authorization: Bearer <token>` cho các request tiếp theo. `sessionId` được gắn vào response header `x-session-id`.',
    })
    @ApiBody({ type: LoginUserDto })
    @ApiResponse({
        status: 200,
        description: 'Đăng nhập thành công',
        schema: {
            example: {
                success: true,
                message: 'Login successfully',
                result: {
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    sessionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, type: BadRequestResponseDto, description: 'Sai email hoặc mật khẩu' })
    async login(
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
        @Body() dto: LoginUserDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const loginResult = await this.authService.login(ip, userAgent, dto)
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
        summary: 'Lấy thông tin profile của user đang đăng nhập',
        description:
            'Trả về đầy đủ thông tin cá nhân, role, phòng ban, chức danh của user hiện tại.',
    })
    @ApiResponse({
        status: 200,
        description: 'Thông tin profile',
        type: UserResponseDto,
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getProfile(@Req() request: Request) {
        const userPayload = await request['user']
        return this.authService.getProfile(userPayload.sub)
    }

    @Patch('profile')
    @HttpCode(200)
    @ResponseMessage('Update profile successfully')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Cập nhật thông tin profile cá nhân',
        description:
            'Cho phép user tự cập nhật: tên hiển thị, ảnh đại diện, số điện thoại, email cá nhân. Mỗi field đều optional — chỉ truyền field cần thay đổi.',
    })
    @ApiBody({ type: UpdateProfileDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: UserResponseDto })
    @ApiResponse({ status: 400, type: BadRequestResponseDto })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updateProfile(
        @Req() request: any,
        @Ip() ip: string,
        @Body() dto: UpdateProfileDto
    ) {
        const userPayload: TokenPayload = request.user
        const result = await this.authService.updateProfile(userPayload.sub, dto)
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
    @ApiBearerAuth()
    @ResponseMessage('Get user permissions successfully')
    @ApiOperation({
        summary: 'Lấy danh sách quyền hạn hiệu lực của user đang đăng nhập',
        description:
            'Trả về mảng các permission code sau khi đã tính toán: quyền từ Role + GRANT override − DENY override. Ví dụ: `["job.read", "job.create", "user.read"]`.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách permission codes',
        schema: {
            example: {
                success: true,
                message: 'Get user permissions successfully',
                result: ['job.read', 'job.create', 'user.read'],
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    async getUserPermissions(@Req() request: Request) {
        const userPayload = await request['user']
        return this.authService.getEffectivePermissions(userPayload.sub)
    }

    @Get('sessions')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Lấy danh sách phiên đăng nhập đang hoạt động',
        description:
            'Trả về tất cả session hiện tại của user từ Redis, bao gồm: IP, device, thời gian tạo. Dùng để hiển thị màn hình "Quản lý thiết bị".',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách active sessions',
        schema: {
            example: {
                success: true,
                message: '',
                result: [
                    {
                        sessionId: 'uuid',
                        ipAddress: '192.168.1.1',
                        userAgent: 'Mozilla/5.0...',
                        createdAt: '2026-05-26T07:00:00.000Z',
                    },
                ],
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    async getSessions(@Req() request: any) {
        const userPayload: TokenPayload = request.user
        return this.sessionService.getActiveSessions(userPayload.sub)
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Send email reset password successfully')
    @ApiOperation({
        summary: 'Yêu cầu gửi email đặt lại mật khẩu',
        description:
            'Gửi link đặt lại mật khẩu đến email đã đăng ký. Vì lý do bảo mật, luôn trả về thành công dù email có tồn tại hay không.',
    })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Email đã được gửi (hoặc không tồn tại — không tiết lộ)',
        schema: {
            example: {
                success: true,
                message: 'Send email reset password successfully',
                result: { message: 'If email exists, reset link has been sent.' },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email)
    }

    @Post('forgot-password/reset')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({
        summary: 'Đặt lại mật khẩu bằng token từ email',
        description:
            'Xác minh token trong link email và cập nhật mật khẩu mới. Token chỉ dùng được một lần và có thời hạn.',
    })
    @ApiBody({ type: ResetPasswordWithTokenDto })
    @ApiResponse({
        status: 200,
        description: 'Đặt lại mật khẩu thành công',
        schema: { example: { message: 'Password reset successfully' } },
    })
    @ApiResponse({ status: 400, type: BadRequestResponseDto, description: 'Token không hợp lệ hoặc đã hết hạn' })
    async resetPasswordWithToken(@Body() dto: ResetPasswordWithTokenDto) {
        return this.authService.resetPasswordWithToken(dto.token, dto.newPassword)
    }

    @Delete('sessions/all')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Đăng xuất khỏi tất cả thiết bị',
        description:
            'Xóa toàn bộ session trong Redis. Tất cả thiết bị đang đăng nhập sẽ bị buộc đăng xuất ngay lập tức.',
    })
    @ResponseMessage('Logged out from all devices successfully')
    @ApiResponse({
        status: 200,
        description: 'Đã đăng xuất tất cả',
        schema: {
            example: {
                success: true,
                message: 'Logged out from all devices successfully',
                result: { success: true },
                timestamp: '2026-05-26T07:00:00.000Z',
            },
        },
    })
    async revokeAll(@Req() request: any, @Ip() ip: string) {
        const userPayload: TokenPayload = request.user
        await this.sessionService.revokeAllSessions(userPayload.sub)
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
    @ApiOperation({
        summary: 'Đăng xuất một thiết bị cụ thể',
        description: 'Xóa session theo `sessionId`. Thiết bị đó sẽ bị đăng xuất khi gọi API tiếp theo.',
    })
    @ApiParam({
        name: 'sessionId',
        description: 'UUID của session cần huỷ',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    @ResponseMessage('Session revoked successfully')
    @ApiResponse({ status: 200, description: 'Session đã bị huỷ' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async revokeSession(
        @Req() request: Request,
        @Param('sessionId', ParseUUIDPipe) sessionId: string,
        @Ip() ip: string
    ) {
        const userPayload: TokenPayload = request['user']
        await this.sessionService.revokeSession(userPayload.sub, sessionId)
        await this.securityService.createLog({
            userId: userPayload.sub,
            event: 'Session Revoked / Remote Logout',
            status: 'SUCCESS',
            ipAddress: ip,
        })
        return
    }
}
