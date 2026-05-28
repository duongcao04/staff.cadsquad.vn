import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { UnauthorizedResponseDto } from '../../common/swagger/api-response.dto'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { GalleryResponseDto } from './dto/gallery-response.dto'
import { UploadGalleryDto } from './dto/upload-gallery.dto'
import { GalleryService } from './gallery.service'

@ApiTags('Gallery')
@ApiBearerAuth()
@Controller('gallery')
@UseGuards(JwtGuard)
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) {}

    @Post('upload')
    @HttpCode(201)
    @ResponseMessage('Upload successfully')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Upload file vào gallery cá nhân',
        description:
            'Upload file (ảnh, video, PDF, ...) lên Cloudinary và lưu metadata vào gallery của user hiện tại.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: { type: 'string', format: 'binary', description: 'File cần upload' },
                category: { type: 'string', description: 'Phân loại gallery item', example: 'PORTFOLIO' },
                description: { type: 'string', description: 'Mô tả file', example: 'Logo ABC Corp v2' },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'File đã được upload vào gallery',
        type: GalleryResponseDto,
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async upload(
        @Req() request: Request,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadGalleryDto
    ) {
        const userPayload: TokenPayload = await request['user']
        return this.galleryService.upload(file, userPayload.sub, dto)
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get gallery successfully')
    @ApiOperation({
        summary: 'Lấy danh sách gallery của user hiện tại',
        description: 'Trả về tất cả items trong gallery cá nhân của user đang đăng nhập.',
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách gallery items',
        type: [GalleryResponseDto],
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async findAll(@Req() request: Request) {
        const userPayload: TokenPayload = await request['user']
        return this.galleryService.getByUser(userPayload.sub)
    }

    @Delete(':id')
    @HttpCode(200)
    @ResponseMessage('Delete gallery item successfully')
    @ApiOperation({
        summary: 'Xóa một item khỏi gallery',
        description:
            'Xóa item khỏi database và Cloudinary. Có thể truyền thêm `publicId` để xóa trực tiếp từ Cloudinary.',
    })
    @ApiParam({ name: 'id', description: 'UUID của gallery item cần xóa', example: 'uuid-of-gallery-item' })
    @ApiQuery({
        name: 'publicId',
        required: false,
        description: 'Cloudinary public ID để xóa file trực tiếp',
        example: 'gallery/user123/abc-logo',
    })
    @ApiResponse({ status: 200, description: 'Gallery item đã được xóa' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async remove(@Param('id') id: string, @Query('publicId') publicId?: string) {
        return this.galleryService.delete(id, publicId)
    }
}
