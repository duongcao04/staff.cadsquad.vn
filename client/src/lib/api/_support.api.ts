import { ApiResponse, axiosClient } from '@/lib/axios'; 
import { TCreateTicketInput, TSupportTicket } from '../validationSchemas';

export const supportApi = {
    /**
     * Create a new support ticket
     */
    createTicket: async (data: TCreateTicketInput) => {
        return axiosClient
            .post<ApiResponse<TSupportTicket>>('/v1/support/ticket', data)
            .then((res) => res.data);
    },

    /**
     * Update an existing ticket (status, description, etc.)
     */
    updateTicket: async (ticketId: string, data: Partial<TCreateTicketInput>) => {
        return axiosClient
            .patch<ApiResponse<TSupportTicket>>(`/v1/support/ticket/${ticketId}`, data)
            .then((res) => res.data);
    },

    /**
     * Fetch all tickets for the authenticated user
     */
    findAll: async () => {
        return axiosClient
            .get<
                ApiResponse<{
                    tickets: TSupportTicket[];
                    total: number;
                }>
            >('/v1/support/tickets')
            .then((res) => res.data);
    },

    /**
     * Fetch details for a specific ticket
     */
    findOne: async (ticketId: string) => {
        return axiosClient
            .get<ApiResponse<TSupportTicket>>(`/v1/support/ticket/${ticketId}`)
            .then((res) => res.data);
    },
};