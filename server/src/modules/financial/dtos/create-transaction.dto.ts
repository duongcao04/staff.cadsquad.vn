import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { TransactionStatus, TransactionType } from '../../../generated/prisma'

export class CreateTransactionDto {
    @ApiProperty({
        description: 'Số tiền giao dịch (đơn vị theo currency)',
        example: 5000000,
    })
    @IsNumber()
    amount!: number

    @ApiPropertyOptional({
        description: 'Đơn vị tiền tệ (mặc định VND)',
        example: 'VND',
    })
    @IsString()
    @IsOptional()
    currency?: string

    @ApiProperty({
        description: 'Loại giao dịch: INCOME (thu từ khách) hoặc EXPENSE (trả cho staff)',
        enum: TransactionType,
        example: TransactionType.INCOME,
    })
    @IsEnum(TransactionType)
    type!: TransactionType

    @ApiPropertyOptional({
        description: 'Trạng thái giao dịch. Mặc định PENDING khi tạo mới.',
        enum: TransactionStatus,
        example: TransactionStatus.COMPLETED,
    })
    @IsEnum(TransactionStatus)
    @IsOptional()
    status?: TransactionStatus

    @ApiPropertyOptional({
        description: 'Mã tham chiếu giao dịch (số biên lai, mã chuyển khoản, ...)',
        example: 'REF-2026-0526-001',
    })
    @IsString()
    @IsOptional()
    referenceNo?: string

    @ApiPropertyOptional({
        description: 'Ghi chú nội bộ về giao dịch này',
        example: 'Thanh toán đợt 1 - Thiết kế logo ABC Corp',
    })
    @IsString()
    @IsOptional()
    note?: string

    @ApiPropertyOptional({
        description: 'URL ảnh/file bằng chứng chuyển khoản',
        example: 'https://storage.cadsquad.vn/evidence/receipt-001.jpg',
    })
    @IsString()
    @IsOptional()
    evidenceUrl?: string

    @ApiProperty({
        description: 'ID job liên quan đến giao dịch này',
        example: 'uuid-of-job',
    })
    @IsUUID()
    jobId!: string

    @ApiPropertyOptional({
        description: 'ID khách hàng (client) — dùng cho giao dịch loại INCOME',
        example: 'uuid-of-client',
    })
    @IsUUID()
    @IsOptional()
    clientId?: string

    @ApiPropertyOptional({
        description: 'ID assignment — dùng cho giao dịch loại EXPENSE (trả tiền staff)',
        example: 'uuid-of-assignment',
    })
    @IsUUID()
    @IsOptional()
    assignmentId?: string

    @ApiPropertyOptional({
        description: 'ID kênh thanh toán sử dụng',
        example: 'uuid-of-payment-channel',
    })
    @IsUUID()
    @IsOptional()
    paymentChannelId?: string
}
