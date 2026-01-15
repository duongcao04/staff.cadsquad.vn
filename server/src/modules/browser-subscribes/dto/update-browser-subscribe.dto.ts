import { PartialType } from '@nestjs/swagger';
import { CreateBrowserSubscribeDto } from './create-browser-subscribe.dto';

export class UpdateBrowserSubscribeDto extends PartialType(
	CreateBrowserSubscribeDto,
) { }