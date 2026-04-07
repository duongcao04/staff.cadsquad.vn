import { z } from 'zod'

// 1. Define the Enums to match your Prisma Schema
export const TicketCategoryEnum = z.enum([
    'BUG',
    'JOB',
    'SYSTEM',
    'BILLING',
    'ACCOUNT',
    'OTHER',
])

export const TicketStatusEnum = z.enum([
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
])

// 2. Define the Main Support Ticket Schema
export const SupportTicketSchema = z.object({
    id: z.string().cuid(),
    subject: z
        .string()
        .min(5, 'Subject is too short, greater than 5 characters'),
    category: TicketCategoryEnum,
    status: TicketStatusEnum,
    description: z
        .string()
        .min(10, 'Description must be detailed, greater than 10 characters'),
    userId: z.string(),
    createdAt: z.date().or(z.string().datetime()),
    updatedAt: z.date().or(z.string().datetime()).optional(),
})

// 3. Infer Types
export type TSupportTicket = z.infer<typeof SupportTicketSchema>

// 4. Input Schema (for Form Validation/DTO)
export const CreateTicketSchema = SupportTicketSchema.omit({
    id: true,
    status: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
})

export type TCreateTicketInput = z.infer<typeof CreateTicketSchema>
