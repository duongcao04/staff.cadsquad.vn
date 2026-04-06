import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSystemSettingDto {
	@IsString()
	@IsNotEmpty()
	key!: string;

	@IsString()
	@IsNotEmpty()
	value!: string; // Expecting stringified JSON
}