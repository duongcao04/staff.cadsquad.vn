import * as yup from 'yup'
import { z } from 'zod'

export const CreateUserSchema = yup.object().shape({
    email: yup.string().required('Email is required'),
    avatar: yup.string(),
    username: yup.string().optional(),
    password: yup.string().optional(),
    displayName: yup.string().required('Display name is required'),
    jobTitleId: yup.string().optional(),
    departmentId: yup.string().optional(),
    phoneNumber: yup.string().optional(),

    // Optional enum validation
    role: yup
        .mixed<'USER' | 'ADMIN' | 'ACCOUNTING'>()
        .oneOf(['USER', 'ADMIN', 'ACCOUNTING'], 'Invalid role')
        .default('USER'),
})
export type TCreateUserInput = yup.InferType<typeof CreateUserSchema>

export const UpdateUserSchema = yup.object().shape({
    email: yup.string().optional(),
    avatar: yup.string().optional(),
    username: yup.string().optional(),
    password: yup.string().optional(),
    displayName: yup.string().optional(),
    jobTitleId: yup.string().optional(),
    departmentId: yup.string().optional(),
    phoneNumber: yup.string().optional(),
    roleId: yup.string().optional(),
})
export type TUpdateUserInput = yup.InferType<typeof UpdateUserSchema>

// Define the available roles to match your backend/Prisma enum
export const RoleEnum = z.enum(['ADMIN', 'USER', 'ACCOUNTING'])

export const editUserSchema = z.object({
    displayName: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .regex(
            /^[a-zA-Z0-9_.]+$/,
            'Username can only contain letters, numbers, underscores, and dots'
        ),
    email: z.string().email('Please enter a valid email address'),
    phoneNumber: z.string().optional().or(z.literal('')),
})

// Export the type to be used in the component
export type TEditUser = z.infer<typeof editUserSchema>

export const userQuerySchema = z.object({
    // Removed .default() to allow "No Pagination" mode
    page: z.coerce.number().min(1).optional(),

    limit: z.coerce.number().min(1).max(100).optional(),

    search: z.string().optional(),

    departmentId: z.string().uuid('Invalid Department ID').optional(),

    role: z.enum(['ADMIN', 'USER', 'ACCOUNTING', 'STAFF']).optional(),

    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Export type để dùng trong Service/Controller
export type TUserQueryInput = z.infer<typeof userQuerySchema>
