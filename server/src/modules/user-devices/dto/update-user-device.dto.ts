import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDeviceDto } from './create-user-device.dto';
import { IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateUserDeviceDto extends PartialType(CreateUserDeviceDto) {
	@ApiProperty({ description: 'Status of the device', required: false, example: true })
	@IsOptional()
	@IsBoolean()
	status?: boolean;

	@ApiProperty({ description: 'The values of the device subscription', required: false, type: [String] })
	@IsOptional()
	@IsArray()
	values?: string[];
}