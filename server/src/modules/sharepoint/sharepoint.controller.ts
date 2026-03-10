import {
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
import { SharePointService } from './sharepoint.service'

@Controller('sharepoint')
// @UseGuards(JwtGuard) // Bảo vệ toàn bộ API bằng Token Local
export class SharePointController {
	constructor(private readonly service: SharePointService) { }

	// 1. Lấy danh sách file
	// GET /api/v1/sharepoint/items?folderId=xxx
	// Nếu không truyền folderId -> Lấy Root
	@Get('items')
	async listItems(@Query('folderId') folderId?: string) {
		return this.service.getItems(folderId)
	}

	// 2. Upload File
	// POST /api/v1/sharepoint/upload
	// Body: parentId (id thư mục cha, hoặc 'root'), file (binary)
	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Body('parentId') parentId: string = 'root'
	) {
		return this.service.uploadFile(parentId, file)
	}

	// 3. Tạo Folder mới
	// POST /api/v1/sharepoint/folder
	// Body: { parentId: "xxx", name: "New Project" }
	@Post('folder')
	async createFolder(@Body() body: { parentId: string; name: string }) {
		return this.service.queueCreateFolder(body.parentId || 'root', body.name)
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

	// 6. Lấy Folder ID từ path
	@Get('resolve-path')
	async getIdFromPath(@Query('path') path: string) {
		// Gọi: GET /sharepoint/resolve-path?path=CSD- TEAM/ST006. CH.DUONG
		const id = await this.service.getFolderIdByPath(path)
		return { path, id }
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
	@Post('copy')
	async copyItem(
		@Body() body: {
			itemId: string;
			destinationFolderId: string;
			newName?: string
		}
	) {
		return this.service.copyItem(
			body.itemId,
			body.destinationFolderId,
			body.newName
		);
	}
}
