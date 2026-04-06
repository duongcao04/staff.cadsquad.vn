import { type ApiResponse, axiosClient } from '@/lib/axios'
import { TCreateTransactionInput } from '../validationSchemas/_transaction.schema'
import queryString from 'query-string'

export const financialApi = {
    // Tạo giao dịch mới
    createTransaction: async (data: TCreateTransactionInput) => {
        return axiosClient
            .post<ApiResponse<any>>('/v1/financials/transactions', data)
            .then((res) => res.data)
    },

    bulkPayout: async (data: any) => {
        return axiosClient
            .post<ApiResponse<any>>('/v1/financials/bulk-payout', data)
            .then((res) => res.data)
    },

    // Lấy toàn bộ lịch sử giao dịch (Ledger)
    findAllTransactions: async (params: any) => {
        const query = queryString.stringify(params || {})
        return axiosClient
            .get<ApiResponse<any>>(`/v1/financials/transactions?${query}`)
            .then((res) => res.data)
    },

    // Lấy danh sách khách nợ (Receivable)
    getReceivable: async (params?: any) => {
        const query = queryString.stringify(params || {})
        return axiosClient
            .get<ApiResponse<any>>(`/v1/financials/receivable?${query}`)
            .then((res) => res.data)
    },

    // Lấy danh sách nợ Staff (Payable)
    getPayable: async (params?: any) => {
        const query = queryString.stringify(params || {})
        return axiosClient
            .get<ApiResponse<any>>(`/v1/financials/payable?${query}`)
            .then((res) => res.data)
    },

    // Lấy thống kê tổng quan
    getStats: async () => {
        return axiosClient
            .get<ApiResponse<any>>('/v1/financials/stats')
            .then((res) => res.data)
    },
}
