import { financialApi } from '@/lib/api/financial.api'
import {
    JobReceivableSchema,
    TCreateTransactionInput,
    TJobReceivable
} from '@/lib/validationSchemas'
import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { parseList } from '../../zod'
import { onErrorToast } from '../helper'

export const financialQueryKeys = {
    all: ['financials'] as const,
    stats: () => [...financialQueryKeys.all, 'stats'] as const,
    receivable: (params: any) =>
        [...financialQueryKeys.all, 'receivable', params] as const,
    payable: (params: any) =>
        [...financialQueryKeys.all, 'payable', params] as const,
}

// 1. Hook lấy thống kê tổng quan (Dashboard)
export const financialStatsOptions = () =>
    queryOptions({
        queryKey: financialQueryKeys.stats(),
        queryFn: () => financialApi.getStats(),
        select: (res) => res.result, // Trả về { totalRevenue, totalExpenses, netProfit }
    })

export const ledgerTransactionsOptions = (
    params: any = { page: 1, limit: 20 }
) =>
    queryOptions({
        queryKey: [...financialQueryKeys.all, 'ledger', params],
        queryFn: () => financialApi.findAllTransactions(params),
        select: (res) => ({
            transactions: res.result?.data,
            paginate: res.result?.paginate,
        }),
    })

// 2. Hook lấy danh sách khách nợ (Receivable Jobs)
export const receivableJobsOptions = (params: any = {}) =>
    queryOptions({
        queryKey: financialQueryKeys.receivable(params),
        queryFn: () => financialApi.getReceivable(params),
        select: (res) => {
            // Parse list jobs và giữ lại field 'financial' ảo từ backend
            return parseList(
                JobReceivableSchema,
                res.result
            ) as TJobReceivable[]
        },
    })

// 3. Hook lấy danh sách nợ Staff (Payable Assignments)
export const payableJobsOptions = (params: any = {}) =>
    queryOptions({
        queryKey: financialQueryKeys.payable(params),
        queryFn: () => financialApi.getPayable(params),
        select: (res) => res.result, // Map theo cấu trúc summary từ backend
    })

// --- Mutations ---

// 4. Mutation tạo giao dịch (Thanh toán)
export const createTransactionOptions = mutationOptions({
    mutationFn: (data: TCreateTransactionInput) =>
        financialApi.createTransaction(data),
    onError: (err) => onErrorToast(err, 'Giao dịch thất bại'),
})

export const bulkRecordPayoutOptions = mutationOptions({
    mutationFn: (data: { jobIds: string[]; paymentChannelId?: string }) =>
        financialApi.bulkPayout(data),
    onError: (err) => onErrorToast(err, 'Bulk payout failed'),
})
