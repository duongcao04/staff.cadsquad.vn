import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CopyItemDto } from './dtos/copy-item.dto'
import { SharePointService } from './sharepoint.service'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'

@Controller('sharepoint')
// @UseGuards(JwtGuard) // Bảo vệ toàn bộ API bằng Token Local
export class SharePointController {
	constructor(private readonly service: SharePointService) {}

	// 1. Lấy danh sách file
	// GET /api/v1/sharepoint/items?folderId=xxx
	// Nếu không truyền folderId -> Lấy Root
	@Get('items')
	@ResponseMessage('Get folder items successfully')
	async listItems(@Query('folderId') folderId?: string) {
		return this.service.getItems(folderId)
	}

	// 2. Upload File
	// POST /api/v1/sharepoint/upload
	// Body: parentId (id thư mục cha, hoặc 'root'), file (binary)
	@Post('queu-upload')
	@UseInterceptors(FileInterceptor('file'))
	async queuUploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Body('parentId') parentId: string = 'root'
	) {
		// Pass to service to handle queuing
		return this.service.queueUploadFile(parentId, file)
	}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file')) // 'file' là tên trường (field name) Frontend sẽ gửi lên
	async executeUploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Body('parentId') parentId: string
	) {
		if (!file) {
			throw new BadRequestException('No file uploaded')
		}

		// Nếu Frontend không gửi parentId, mặc định lưu vào thư mục 'root'
		const targetFolderId = parentId || 'root'

		// Gọi hàm service bạn vừa sửa ở trên
		return this.service.executeUploadFile(targetFolderId, file)
	}

	// 3. Tạo Folder mới
	// POST /api/v1/sharepoint/folder
	// Body: { parentId: "xxx", name: "New Project" }
	@Post('folder')
	async createFolder(@Body() body: { parentId: string; name: string }) {
		return this.service.queueCreateFolder(
			body.parentId || 'root',
			body.name
		)
	}

	// 4. Lấy link Download
	// GET /api/v1/sharepoint/download/xxx-item-id-xxx
	@Get('download/:id')
	async getDownloadLink(@Param('id') id: string) {
		return this.service.getDownloadUrl(id)
	}

	// 5. Xóa File/Folder
	// DELETE /api/v1/sharepoint/items/xxx-item-id-xxx
	@Delete('items/:id')
	async deleteItem(@Param('id') id: string) {
		return this.service.deleteItem(id)
	}

	// 6. Lấy Folder Detail từ path
	@Get('resolve-path')
	async getIdFromPath(@Query('path') path: string) {
		// Gọi: GET /sharepoint/resolve-path?path=CSD- TEAM/ST006. CH.DUONG
		const detail = await this.service.getFolderDetailsByPath(path)
		return { path, detail }
	}
	/**
	 *  7. Liệt kê tất cả Document Libraries (Drives) trong Site hiện tại
	 */
	@Get('drives')
	async getDrives() {
		return this.service.listDrives()
	}

	// 8. Sao chép File/Folder
	// POST /api/v1/sharepoint/copy
	// Body: { itemId: "xxx", destinationFolderId: "yyy", newName: "Optional Name" }
	@Post('queu-copy')
	async queuCopyItem(@Body() dto: CopyItemDto) {
		return this.service.queueCopyItem(
			dto.itemId,
			dto.destinationFolderId,
			dto.newName
		)
	}

	@Post('copy')
	async copyItem(@Body() dto: CopyItemDto) {
		return this.service.excuteCopySharepointFolder({
			destinationFolderId: dto.destinationFolderId,
			itemId: dto.itemId,
			newName: dto.newName,
		})
	}

	// 9. Lấy thông tin chi tiết của Folder (hoặc File)
	// GET /api/v1/sharepoint/folder/xxx-folder-id-xxx
	@Get('folder/:id')
	async getFolderDetails(@Param('id') id: string) {
		if (!id) {
			throw new BadRequestException('Folder ID is required')
		}

		return this.service.getFolderDetails(id)
	}
}
