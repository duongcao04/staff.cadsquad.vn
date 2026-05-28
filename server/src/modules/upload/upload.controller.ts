import {
    Controller,
    Delete,
    HttpCode,
    Param,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { BadRequestResponseDto, UnauthorizedResponseDto } from '../../common/swagger/api-response.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { UploadResponseDto } from './dto/upload-response.dto'
import { UploadService } from './upload.service'

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtGuard)
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post('image')
    @HttpCode(201)
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Upload ảnh lên Cloudinary',
        description:
            'Upload file ảnh và lưu lên Cloudinary. Trả về URL công khai để dùng trong profile, job, ...',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['image'],
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                    description: 'File ảnh cần upload (jpg, png, webp, ...)',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Ảnh đã được upload thành công',
        type: UploadResponseDto,
    })
    @ApiResponse({ status: 400, type: BadRequestResponseDto, description: 'Không có file hoặc sai định dạng' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    insertImage(@UploadedFile() image: Express.Multer.File) {
        return this.uploadService.insertImage(image)
    }

    @Delete('images/:id')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Xóa ảnh đã upload',
        description: 'Xóa ảnh khỏi Cloudinary theo ID số nguyên của bản ghi trong database.',
    })
    @ApiParam({ name: 'id', description: 'ID số nguyên của bản ghi ảnh trong database', example: '42' })
    @ApiResponse({ status: 200, description: 'Ảnh đã được xóa thành công' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    deleteImage(@Param('id') id: string) {
        return this.uploadService.delete(+id)
    }
}
