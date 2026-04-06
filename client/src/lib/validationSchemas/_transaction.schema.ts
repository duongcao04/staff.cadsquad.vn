import { z } from 'zod'

export enum ETransactionType {
    INCOME = 'INCOME',
    PAYOUT = 'PAYOUT',
    REFUND = 'REFUND'
}

export enum ETransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export const TransactionSchema = z.object({
    id: z.string(),
    amount: z.coerce.number(),
    currency: z.string().default('VND'),
    type: z.nativeEnum(ETransactionType),
    status: z.nativeEnum(ETransactionStatus),
    referenceNo: z.string().nullable(),
    note: z.string().nullable(),
    evidenceUrl: z.string().nullable(),
    jobId: z.string(),
    clientId: z.string().nullable(),
    assignmentId: z.string().nullable(),
    paymentChannelId: z.string().nullable(),
    createdById: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})

export type TTransaction = z.infer<typeof TransactionSchema>

// Schema cho form tạo giao dịch (Income/Payout)
export const CreateTransactionInputSchema = z.object({
    amount: z.coerce.number().min(1, 'Amount must be at least 1'),
    type: z.nativeEnum(ETransactionType),
    jobId: z.string().min(1, 'Job is required'),
    clientId: z.string().optional(), // Bắt buộc nếu là INCOME (validate ở level logic hoặc refine)
    assignmentId: z.string().optional(), // Bắt buộc nếu là PAYOUT
    paymentChannelId: z.string().optional(),
    referenceNo: z.string().optional(),
    note: z.string().optional(),
    evidenceUrl: z.string().optional(),
})

export type TCreateTransactionInput = z.infer<typeof CreateTransactionInputSchema>

// Schema cho dữ liệu tài chính của Job (Receivable/Payable)
export const JobFinancialSummarySchema = z.object({
    totalPaid: z.number().default(0),
    remainingAmount: z.number().default(0),
    isPartiallyPaid: z.boolean().default(false),
})