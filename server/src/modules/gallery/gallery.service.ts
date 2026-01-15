import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { UploadGalleryDto } from './dto/upload-gallery.dto'
import { plainToInstance } from 'class-transformer'
import { GalleryResponseDto } from './dto/gallery-response.dto'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { CloudinaryService } from '../../providers/cloudinary/cloudinary.service'

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) { }
  private readonly logger = new Logger(GalleryService.name)

  async upload(file: Express.Multer.File, userId: string, dto: UploadGalleryDto) {
    const uploadResult = await this.cloudinary.uploadFile(file, dto.folder || 'user_gallery')
    try {
      const upload = await this.prisma.$transaction(async tx => {
        await this.cloudinary.uploadFile(file, dto.folder || 'user_gallery')
        return await tx.gallery.create({
          data: {
            title: dto.title || uploadResult.original_filename,
            description: dto.description,
            url: uploadResult.secure_url,
            user: {
              connect: {
                id: userId
              }
            },
          },
        })
      })

      return plainToInstance(GalleryResponseDto, upload, {
        excludeExtraneousValues: true,
      })
    } catch (error) {
      this.logger.error(error.message)
      throw new BadRequestException()
    }
  }

  async getByUser(userId: string) {
    try {
      const result = await this.prisma.gallery.findMany({
        where: {
          userId
        }
      })

      return plainToInstance(GalleryResponseDto, result, {
        excludeExtraneousValues: true,
      })
    } catch (error) {
      this.logger.error(error.message)
      throw new BadRequestException()
    }
  }

  async findAll(userId: string) {
    const galleries = await this.prisma.gallery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return plainToInstance(GalleryResponseDto, galleries, {
      excludeExtraneousValues: true,
    })
  }

  async delete(id: string, publicId?: string) {
    if (publicId) await this.cloudinary.deleteFile(publicId)
    return this.prisma.gallery.delete({ where: { id } })
  }
}
