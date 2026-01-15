import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBrowserSubscribeDto {
	@ApiProperty({ description: 'The endpoint URL for the subscription' })
	@IsString()
	@IsNotEmpty()
	readonly endpoint: string;

	@ApiProperty({ description: 'The expiration time of the subscription', required: false })
	@IsString()
	@IsOptional()
	readonly expirationTime?: string;

	@ApiProperty({ description: 'The P256DH key for the subscription' })
	@IsString()
	@IsNotEmpty()
	readonly p256dh: string;

	@ApiProperty({ description: 'The auth key for the subscription' })
	@IsString()
	@IsNotEmpty()
	readonly auth: string;
}