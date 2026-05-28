import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { BadRequestResponseDto, UnauthorizedResponseDto } from '../../common/swagger/api-response.dto'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { UserService } from '../user/user.service'
import type { Response } from 'express'
import { MfaService } from './mfa.service'

@ApiTags('MFA')
@Controller('mfa')
export class MfaController {
    constructor(
        private readonly mfaService: MfaService,
        private readonly userService: UserService
    ) {}

    @Get('generate')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Bước 1: Tạo QR Code để thiết lập MFA',
        description:
            'Tạo TOTP secret và trả về QR Code dưới dạng Data URL. User dùng Google Authenticator hoặc ứng dụng tương tự để quét QR.',
    })
    @ApiResponse({
        status: 200,
        description: 'QR Code đã được tạo',
        schema: {
            example: { qrCode: 'data:image/png;base64,iVBORw0KGgo...' },
        },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async register(@Res() response: Response, @Req() request: Request) {
        const user: TokenPayload = request['user']
        const { otpauthUrl } = await this.mfaService.generateTwoFactorAuthenticationSecret({
            code: user.code,
            id: user.sub,
        })
        const qrCodeImage = await this.mfaService.generateQrCodeDataURL(otpauthUrl)
        return response.json({ qrCode: qrCodeImage })
    }

    @Post('turn-on')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Bước 2: Bật MFA sau khi quét QR',
        description:
            'Xác minh mã TOTP 6 chữ số từ ứng dụng Authenticator và kích hoạt MFA cho tài khoản.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['code'],
            properties: {
                code: {
                    type: 'string',
                    description: 'Mã TOTP 6 chữ số từ ứng dụng Authenticator',
                    example: '123456',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'MFA đã được kích hoạt',
        schema: { example: { message: 'MFA enabled successfully' } },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto, description: 'Mã TOTP không đúng' })
    async turnOnTwoFactorAuthentication(
        @Req() request: Request,
        @Body('code') code: string
    ) {
        const user: TokenPayload = request['user']
        const isCodeValid = await this.mfaService.isTwoFactorAuthenticationCodeValid(code, user.sub)
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code')
        }
        await this.userService.turnOnTwoFactorAuthentication(user.sub)
        return { message: 'MFA enabled successfully' }
    }

    @Post('authenticate')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Xác thực MFA khi đăng nhập',
        description:
            'Sau khi đăng nhập bằng email/password, dùng endpoint này để xác thực lần 2 với mã TOTP. Trả về token truy cập đầy đủ.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['code'],
            properties: {
                code: {
                    type: 'string',
                    description: 'Mã TOTP 6 chữ số từ ứng dụng Authenticator',
                    example: '654321',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Xác thực MFA thành công',
        schema: { example: { message: 'Authenticated successfully' } },
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto, description: 'Mã TOTP không đúng' })
    async authenticate(@Req() request: Request, @Body('code') code: string) {
        const user: TokenPayload = request['user']
        const isCodeValid = this.mfaService.isTwoFactorAuthenticationCodeValid(code, user.sub)
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code')
        }
        return { message: 'Authenticated successfully' }
    }
}
