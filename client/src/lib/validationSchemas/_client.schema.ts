import { z } from 'zod';
import { EClientType } from '../../shared/enums';
import { JobSchema } from './_job.schema';

export const ClientSchema = z.object({
    id: z.string().catch('N/A'),

    name: z.string().catch('Unknown Client'),

    code: z.string().catch('UNKNOWN'),

    // Rào Enum cho Client Type
    type: z.nativeEnum(EClientType).catch(EClientType.INDIVIDUAL),

    // Các trường thông tin liên hệ (Optional)
    region: z.string().nullable().catch('Unknown Region'),
    country: z.string().nullable().catch('Unknown Country'),
    address: z.string().nullable().catch('Non Address'),
    timezone: z.string().nullable().catch('Non Timezone'),

    email: z.string().email().nullable().catch('unknown@email.com').or(z.string().length(0)), // Cho phép string rỗng
    phoneNumber: z.string().nullable().catch('N/A'),
    billingEmail: z.string().email().nullable().or(z.string().length(0)),
    taxId: z.string().nullable().catch('N/A'),
    currency: z.string().default('USD'),

    paymentTerms: z.number().default(0),

    // Quan hệ với Jobs (Dùng lazy để tránh vòng lặp vô tận với JobSchema)
    jobs: z.array(z.lazy(() => JobSchema)).default([]),

    // Ép kiểu Date từ API string
    createdAt: z.coerce.date().catch(new Date()),
    updatedAt: z.coerce.date().catch(new Date()),
});

export const EditClientFormSchema = z.object({
    name: z.string()
        .min(1, 'Client name is required')
        .max(255, 'Name is too long'),

    code: z.string()
        .min(2, 'Code must be at least 2 characters')
        .max(20, 'Code is too long'),

    type: z.nativeEnum(EClientType, {
        message: 'Please select a valid client type', // Dùng message thay vì errorMap
    }),

    // Sử dụng .nullish() hoặc .or(z.string().length(0)) để xử lý trường không bắt buộc
    email: z.string()
        .email('Invalid email format')
        .or(z.string().length(0)),

    billingEmail: z.string()
        .email('Invalid email format')
        .or(z.string().length(0)),

    phoneNumber: z.string()
        .max(20, 'Phone number is too long')
        .optional(),

    address: z.string().optional(),

    country: z.string().min(1, 'Country is required'),

    taxId: z.string().optional(),

    currency: z.string().default('USD'),

    // Chuyển đổi giá trị input (thường là string) sang number
    paymentTerms: z.coerce.number()
        .min(0, 'Terms cannot be negative')
        .default(30),
});

// Trích xuất Type cho Form Values
export type TEditClientFormValues = z.infer<typeof EditClientFormSchema>;