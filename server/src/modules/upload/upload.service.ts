import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../../providers/cloudinary/cloudinary.service';

@Injectable()
export class UploadService {
  constructor(private readonly cloudinaryService: CloudinaryService) { }
  async insertImage(file: Express.Multer.File) {
    return await this.cloudinaryService.uploadFile(file);
  }

  async delete(id: number) {
    return `This action removes a #${id} upload`;
  }
}
