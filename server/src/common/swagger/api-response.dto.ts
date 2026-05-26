import { ApiProperty } from '@nestjs/swagger'
import { Type } from '@nestjs/common'

/**
 * Mọi API response đều được bọc trong envelope này (trừ @BypassTransform).
 *
 * Ví dụ:
 * {
 *   "success": true,
 *   "message": "Login successfully",
 *   "result": { ... },
 *   "timestamp": "2026-05-26T00:00:00.000Z"
 * }
 */
export class ApiResponseDto<T> {
    @ApiProperty({ description: 'Trạng thái xử lý thành công', example: true })
    success: boolean

    @ApiProperty({
        description: 'Thông báo kết quả từ server',
        example: 'Request processed successfully',
    })
    message: string

    @ApiProperty({ description: 'Dữ liệu trả về' })
    result: T

    @ApiProperty({
        description: 'Thời điểm server xử lý xong (ISO 8601)',
        example: '2026-05-26T07:00:00.000Z',
    })
    timestamp: string
}

/** Factory tạo response class cho Swagger generic type */
export function ApiWrappedResponse<T>(ResultClass: Type<T>) {
    class WrappedResponse extends ApiResponseDto<T> {
        @ApiProperty({ type: () => ResultClass })
        declare result: T
    }
    Object.defineProperty(WrappedResponse, 'name', {
        value: `ApiWrappedResponse<${ResultClass.name}>`,
    })
    return WrappedResponse
}

/** Factory cho array response */
export function ApiWrappedArrayResponse<T>(ResultClass: Type<T>) {
    class WrappedArrayResponse extends ApiResponseDto<T[]> {
        @ApiProperty({ type: () => ResultClass, isArray: true })
        declare result: T[]
    }
    Object.defineProperty(WrappedArrayResponse, 'name', {
        value: `ApiWrappedArrayResponse<${ResultClass.name}>`,
    })
    return WrappedArrayResponse
}

/** Pagination meta */
export class PaginationMetaDto {
    @ApiProperty({ description: 'Tổng số bản ghi', example: 42 })
    total: number

    @ApiProperty({ description: 'Trang hiện tại', example: 1 })
    page: number

    @ApiProperty({ description: 'Số bản ghi mỗi trang', example: 10 })
    limit: number

    @ApiProperty({ description: 'Tổng số trang', example: 5 })
    totalPages: number
}

/** Response 401 Unauthorized */
export class UnauthorizedResponseDto {
    @ApiProperty({ example: 401 })
    statusCode: number

    @ApiProperty({ example: 'Unauthorized' })
    message: string
}

/** Response 403 Forbidden */
export class ForbiddenResponseDto {
    @ApiProperty({ example: 403 })
    statusCode: number

    @ApiProperty({ example: 'Missing required permission: job.read' })
    message: string

    @ApiProperty({ example: 'Forbidden' })
    error: string
}

/** Response 404 Not Found */
export class NotFoundResponseDto {
    @ApiProperty({ example: 404 })
    statusCode: number

    @ApiProperty({ example: 'Resource not found' })
    message: string

    @ApiProperty({ example: 'Not Found' })
    error: string
}

/** Response 400 Bad Request */
export class BadRequestResponseDto {
    @ApiProperty({ example: 400 })
    statusCode: number

    @ApiProperty({
        example: ['email must be an email', 'password should not be empty'],
        type: [String],
    })
    message: string[]

    @ApiProperty({ example: 'Bad Request' })
    error: string
}
