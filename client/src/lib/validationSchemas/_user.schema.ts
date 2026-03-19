import * as yup from 'yup';
import { z, ZodType } from 'zod';
import { TRole, TUser } from '../../shared/types';
import { optimizeCloudinary } from '../cloudinary';
import { IMAGES } from '../utils';
import { DepartmentSchema } from './_department.schema';
import { JobTitleSchema } from './_job-title.schema';
import { RoleSchema } from './_role.schema';

export const UserSchema: ZodType<TUser> = z.lazy(() => z.object({
    id: z.string().catch('N/A'),
    displayName: z.string().catch('Unknown User'),

    avatar: z.string().default(IMAGES.emptyAvatar).transform((val) => {
        return optimizeCloudinary(val);
    }),

    code: z.string().catch('UNKNOWN'),

    personalEmail: z.string().nullable().catch(null),
    email: z.string().email().catch('unknown@cadsquad.vn'),

    username: z.string().catch('unknown'),
    phoneNumber: z.string().nullable().catch('Unknown phone number'),

    department: DepartmentSchema.nullable().catch(null),
    jobTitle: JobTitleSchema.nullable().catch(null),
    role: RoleSchema.catch({} as TRole),

    isActive: z.preprocess((val) => Boolean(val), z.boolean().default(false)),

    // Mảng: Định nghĩa schema cho item trong mảng sẽ tốt hơn z.any()
    files: z.array(z.any()).default([]),
    accounts: z.array(z.any()).default([]),
    notifications: z.array(z.any()).default([]),
    configs: z.array(z.any()).default([]),
    securityLogs: z.array(z.any()).default([]),
    filesCreated: z.array(z.any()).default([]),
    jobActivityLog: z.array(z.any()).default([]),
    jobsCreated: z.array(z.any()).default([]),
    sendedNotifications: z.array(z.any()).default([]),

    lastLoginAt: z.coerce.date().nullable().catch(null),
    createdAt: z.coerce.date().catch(new Date()),
    updatedAt: z.coerce.date().catch(new Date()),
}));

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
    personalEmail: z.string().email('Personal email is invalid').optional(),
    phoneNumber: z.string().optional().or(z.literal('')),
})

// Export the type to be used in the component
export type TEditUser = z.infer<typeof editUserSchema>

export const userQuerySchema = z.object({
    // Removed .default() to allow "No Pagination" mode
    page: z.coerce.number().min(1).optional(),

    limit: z.coerce.number().min(1).max(100).optional(),

    search: z.string().optional(),

    departmentId: z.string().optional(),

    role: z.enum(['ADMIN', 'USER', 'ACCOUNTING', 'STAFF']).optional(),

    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Export type để dùng trong Service/Controller
export type TUserQueryInput = z.infer<typeof userQuerySchema>
