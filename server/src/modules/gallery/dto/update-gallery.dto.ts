import { PartialType } from '@nestjs/swagger';
import { UploadGalleryDto } from './upload-gallery.dto';

export class UpdateGalleryDto extends PartialType(UploadGalleryDto) { }
