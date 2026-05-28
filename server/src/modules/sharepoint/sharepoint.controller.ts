import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
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
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { BadRequestResponseDto } from '../../common/swagger/api-response.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { CopyItemDto } from './dtos/copy-item.dto'
import { SharePointService } from './sharepoint.service'

@ApiTags('SharePoint')
@ApiBearerAuth()
@Controller('sharepoint')
@UseGuards(JwtGuard)
export class SharePointController {
    constructor(private readonly service: SharePointService) {}

    @Get('items')
    @HttpCode(200)
    @ResponseMessage('Get folder items successfully')
    @ApiOperation({
        summary: 'Lấy danh sách file/folder trong SharePoint',
        description:
            'Trả về nội dung thư mục theo `folderId`. Nếu không truyền `folderId` → lấy root của drive.',
    })
    @ApiQuery({
        name: 'folderId',
        required: false,
        description: 'ID thư mục SharePoint. Bỏ qua để lấy root.',
        example: 'folder-uuid-from-sharepoint',
    })
    @ApiResponse({ status: 200, description: 'Danh sách items trong thư mục' })
    async listItems(@Query('folderId') folderId?: string) {
        return this.service.getItems(folderId)
    }

    @Post('queu-upload')
    @HttpCode(202)
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Upload file vào hàng đợi (queue)',
        description: 'Đẩy file vào BullMQ queue để xử lý upload lên SharePoint bất đồng bộ.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'File cần upload' },
                parentId: { type: 'string', description: 'ID thư mục đích (mặc định: root)', example: 'root' },
            },
        },
    })
    @ApiResponse({ status: 202, description: 'File đã được đưa vào hàng đợi' })
    async queuUploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('parentId') parentId: string = 'root'
    ) {
        return this.service.queueUploadFile(parentId, file)
    }

    @Post('upload')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Upload file trực tiếp lên SharePoint',
        description: 'Upload file ngay lập tức (không qua queue). Phù hợp cho file nhỏ.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: { type: 'string', format: 'binary', description: 'File cần upload' },
                parentId: { type: 'string', description: 'ID thư mục đích', example: 'root' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'File đã được upload thành công' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto, description: 'Không có file được gửi lên' })
    async executeUploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('parentId') parentId: string
    ) {
        if (!file) throw new BadRequestException('No file uploaded')
        return this.service.executeUploadFile(parentId || 'root', file)
    }

    @Post('folder')
    @HttpCode(201)
    @ApiOperation({
        summary: 'Tạo thư mục mới trong SharePoint',
        description: 'Tạo thư mục mới trong SharePoint. Có thể chỉ định thư mục cha.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name'],
            properties: {
                parentId: { type: 'string', description: 'ID thư mục cha (mặc định: root)', example: 'root' },
                name: { type: 'string', description: 'Tên thư mục mới', example: 'CSD-TEAM/ST001.CH.ANH' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Thư mục đã được tạo trong hàng đợi' })
    async createFolder(@Body() body: { parentId: string; name: string }) {
        return this.service.queueCreateFolder(body.parentId || 'root', body.name)
    }

    @Get('download/:id')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy link download của file',
        description: 'Tạo URL tạm thời để download file từ SharePoint.',
    })
    @ApiParam({ name: 'id', description: 'ID của item SharePoint', example: 'sharepoint-item-id' })
    @ApiResponse({ status: 200, description: 'Download URL', schema: { example: { url: 'https://...' } } })
    async getDownloadLink(@Param('id') id: string) {
        return this.service.getDownloadUrl(id)
    }

    @Delete('items/:id')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Xóa file hoặc folder khỏi SharePoint',
        description: 'Xóa vĩnh viễn item (file/folder) theo ID. Hành động không thể hoàn tác.',
    })
    @ApiParam({ name: 'id', description: 'ID của item SharePoint cần xóa', example: 'sharepoint-item-id' })
    @ApiResponse({ status: 200, description: 'Item đã được xóa' })
    async deleteItem(@Param('id') id: string) {
        return this.service.deleteItem(id)
    }

    @Get('resolve-path')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy chi tiết folder theo đường dẫn',
        description: 'Tìm và trả về metadata của folder từ path tương đối trong SharePoint.',
    })
    @ApiQuery({
        name: 'path',
        required: true,
        description: 'Đường dẫn tương đối trong SharePoint',
        example: 'CSD-TEAM/ST006.CH.DUONG',
    })
    @ApiResponse({ status: 200, description: 'Chi tiết folder' })
    async getIdFromPath(@Query('path') path: string) {
        const detail = await this.service.getFolderDetailsByPath(path)
        return { path, detail }
    }

    @Get('drives')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Liệt kê tất cả Document Libraries trong SharePoint Site',
        description: 'Trả về danh sách tất cả drives (document libraries) trong SharePoint site hiện tại.',
    })
    @ApiResponse({ status: 200, description: 'Danh sách drives' })
    async getDrives() {
        return this.service.listDrives()
    }

    @Post('queu-copy')
    @HttpCode(202)
    @ApiOperation({
        summary: 'Sao chép file/folder vào hàng đợi',
        description: 'Đẩy thao tác sao chép vào queue để xử lý bất đồng bộ.',
    })
    @ApiBody({ type: CopyItemDto })
    @ApiResponse({ status: 202, description: 'Thao tác copy đã được đưa vào hàng đợi' })
    async queuCopyItem(@Body() dto: CopyItemDto) {
        return this.service.queueCopyItem(dto.itemId, dto.destinationFolderId, dto.newName)
    }

    @Post('copy')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Sao chép file/folder ngay lập tức',
        description: 'Thực hiện sao chép file hoặc folder trực tiếp (không qua queue).',
    })
    @ApiBody({ type: CopyItemDto })
    @ApiResponse({ status: 200, description: 'Item đã được sao chép' })
    async copyItem(@Body() dto: CopyItemDto) {
        return this.service.excuteCopySharepointFolder({
            destinationFolderId: dto.destinationFolderId,
            itemId: dto.itemId,
            newName: dto.newName,
        })
    }

    @Get('folder/:id')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Lấy thông tin chi tiết folder theo ID',
        description: 'Trả về metadata đầy đủ của folder (tên, đường dẫn, quyền, ...) theo SharePoint item ID.',
    })
    @ApiParam({ name: 'id', description: 'ID của folder SharePoint', example: 'sharepoint-folder-id' })
    @ApiResponse({ status: 200, description: 'Chi tiết folder' })
    @ApiResponse({ status: 400, type: BadRequestResponseDto, description: 'Thiếu Folder ID' })
    async getFolderDetails(@Param('id') id: string) {
        if (!id) throw new BadRequestException('Folder ID is required')
        return this.service.getFolderDetails(id)
    }
}
