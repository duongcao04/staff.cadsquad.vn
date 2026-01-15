import { z } from 'zod'

export const sendEmailSchema = z.object({
    // Matches @IsNotEmpty() and string | string[]
    to: z.union([
        z.string().min(1, { message: 'Recipient is required' }),
        z
            .array(z.string().email())
            .min(1, { message: 'At least one recipient is required' }),
    ]),

    // Matches @IsOptional() @IsArray()
    cc: z.array(z.string().email('Invalid CC email')).optional(),

    // Matches @IsOptional() @IsArray()
    bcc: z.array(z.string().email('Invalid BCC email')).optional(),

    // Matches @IsOptional() @IsString()
    fromName: z.string().optional(),

    // Matches @IsOptional() @IsString() (Added email validation for safety)
    fromEmail: z
        .string()
        .email('Invalid sender email')
        .optional()
        .or(z.literal('')),

    // Matches @IsNotEmpty() @IsString()
    subject: z.string().min(1, { message: 'Subject is required' }),

    // Matches @IsNotEmpty() @IsString()
    content: z.string().min(1, { message: 'Content is required' }),
})

export type SendEmailFormValues = z.infer<typeof sendEmailSchema>
