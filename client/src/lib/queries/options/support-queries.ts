import { supportApi } from '@/lib/api'
import {
	SupportTicketSchema,
	TCreateTicketInput,
} from '@/lib/validationSchemas'
import { parseData, parseList } from '@/lib/zod'
import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { onErrorToast } from '../helper'

// 1. Keys Factory
export const supportQueryKeys = {
    resource: ['support-tickets'] as const,
    lists: () => [...supportQueryKeys.resource, 'lists'] as const,
    detail: (identify: string) =>
        [...supportQueryKeys.resource, 'identify', identify] as const,
}

// 2. Fetch Options
export const supportTicketsListOptions = () => {
    return queryOptions({
        queryKey: supportQueryKeys.lists(),
        queryFn: () => supportApi.findAll(),
        select: (res) => {
            // Adjust "res.result" or "res.data" based on your specific ApiResponse structure
            const ticketsData = res?.result?.tickets || []
            return {
                tickets: parseList(SupportTicketSchema, ticketsData),
                total: res?.result?.total || 0,
            }
        },
    })
}

export const supportTicketOptions = (identify: string) => {
    return queryOptions({
        queryKey: supportQueryKeys.detail(identify),
        queryFn: () => supportApi.findOne(identify),
        select: (res) => {
            const ticketData = res?.result
            return {
                ticket: parseData(SupportTicketSchema, ticketData),
            }
        },
    })
}

// 3. Mutation Options
export const createSupportTicketOptions = mutationOptions({
    mutationFn: (data: TCreateTicketInput) => supportApi.createTicket(data),
    onError: (err) => onErrorToast(err, 'Failed to submit ticket'),
})

export const updateSupportTicketOptions = mutationOptions({
    mutationFn: ({
        id,
        data,
    }: {
        id: string
        data: Partial<TCreateTicketInput>
    }) => supportApi.updateTicket(id, data),
    onError: (err) => onErrorToast(err, 'Update failed'),
})
