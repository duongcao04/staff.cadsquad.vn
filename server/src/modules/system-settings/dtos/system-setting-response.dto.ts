import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class SystemSettingResponseDto {
	@Expose()
	key!: string;

	@Expose()
	value!: string;

	@Expose()
	updatedAt!: Date;

	@Expose()
	modifierById!: string;

	@Expose()
	modifierBy!: UserResponseDto;
}