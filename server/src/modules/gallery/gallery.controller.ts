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
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { JwtGuard } from '../auth/jwt.guard'
import { GalleryResponseDto } from './dto/gallery-response.dto'
import { UploadGalleryDto } from './dto/upload-gallery.dto'
import { GalleryService } from './gallery.service'

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) { }

  @Post('upload')
  @HttpCode(201)
  @ResponseMessage('Upload successfully')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a file to the gallery' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'The file has been successfully uploaded.',
    type: GalleryResponseDto,
  })
  async upload(@Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadGalleryDto,
  ) {
    const userPayload: TokenPayload = await request['user']
    return this.galleryService.upload(file, userPayload.sub, dto)
  }

  @Get()
  @HttpCode(200)
  @ResponseMessage('Get gallery successfully')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all gallery items for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return a list of gallery items.',
    type: [GalleryResponseDto],
  })
  async findAll(@Req() request: Request) {
    const userPayload: TokenPayload = await request['user']
    return this.galleryService.getByUser(userPayload.sub)
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Delete gallery item successfully')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a gallery item' })
  @ApiResponse({
    status: 200,
    description: 'The gallery item has been successfully deleted.',
  })
  async remove(@Param('id') id: string, @Query('publicId') publicId?: string) {
    return this.galleryService.delete(id, publicId)
  }
}
