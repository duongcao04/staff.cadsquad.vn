import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { EntityEnum } from '../../../generated/prisma'

export class PermissionResponseDto {
	@ApiProperty({ description: 'ID của quyền' })
	@Expose()
	id: string

	@ApiProperty({
		description: 'Tên hiển thị',
		example: 'Đọc thông tin công việc',
	})
	@Expose()
	displayName: string

	@ApiProperty({ description: 'Mã quyền duy nhất', example: 'job.read' })
	@Expose()
	code: string

	@ApiProperty({ enum: EntityEnum, description: 'Thực thể chịu tác động' })
	@Expose()
	entity: EntityEnum

	@ApiProperty({ description: 'Hành động thực hiện', example: 'read' })
	@Expose()
	action: string

	@ApiProperty({
		description: 'Kết hợp thực thể và hành động',
		example: 'JOB.read',
	})
	@Expose()
	entityAction: string

	@ApiProperty({ description: 'Mô tả chi tiết quyền', required: false })
	@Expose()
	description?: string
}
