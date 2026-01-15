import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { Expose } from 'class-transformer';

export class UserDeviceResponseDto {
	id: string

	@ApiProperty({ description: 'Type of the device', default: 'browser', example: 'browser' })
	@Expose()
	type: string = 'browser';

	@ApiProperty({ description: 'ID of the user', example: 'user-id-123' })
	@Expose()
	userId: string;

	@ApiProperty({ description: 'User', example: 'user-id-123' })
	@Expose()
	user: UserResponseDto

	@ApiProperty({ description: 'Status of the device', default: false, example: true })
	@Expose()
	status?: boolean = false;

	@ApiProperty({ description: 'The value of the device subscription', example: '{"endpoint":"...","keys":{"p256dh":"...","auth":"..."}}' })
	@Expose()
	value: string
}