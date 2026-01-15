import { IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetJobsDueDto {
	@ApiProperty({ example: '2025-10-03', description: 'Ngày theo ISO 8601 YYYY-MM-DD' })
	@IsISO8601({ strict: true }, { message: 'Ngày không hợp lệ, phải theo định dạng ISO 8601 (YYYY-MM-DD)' })
	inputDate: string;
}
