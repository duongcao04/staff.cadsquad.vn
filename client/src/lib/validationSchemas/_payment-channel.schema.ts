import * as yup from "yup";
import { z, ZodType } from 'zod';
import { TPaymentChannel } from "../../shared/types";
import { COLORS, IMAGES } from "../utils";
import { JobSchema } from "./_job.schema";

export const PaymentChannelSchema: ZodType<TPaymentChannel> = z.lazy(() => z.object({
    // Sử dụng .catch() để rào nếu ID lỡ bị null/undefined
    id: z.string().catch('N/A'),

    displayName: z.string().catch('Unknown Channel'),

    // Các trường optional có thể dùng .optional() hoặc gán default/null tùy UI
    hexColor: z.string().optional().catch(COLORS.white),

    logoUrl: z.string().optional().catch(IMAGES.cadsquadLogoOrange),

    ownerName: z.string().optional().catch("Unknown owner name"),

    cardNumber: z.string().optional().catch("N/A"),

    // QUAN TRỌNG: Dùng z.lazy để tránh lỗi Circular Dependency với JobSchema
    // Zod sẽ tự động parse danh sách Job liên quan nếu API trả về
    jobs: z.array(z.lazy(() => JobSchema)).default([]),
}) as any);

export const CreatePaymentChannelSchema = yup.object({
    displayName: yup
        .string()
        .required("Display name is required"),

    hexColor: yup
        .string()
        .matches(/^#([0-9A-Fa-f]{6})$/, "hexColor must be a valid hex color code (e.g. #FFFFFF)")
        .optional(),

    logoUrl: yup
        .string()
        .url("logoUrl must be a valid URL")
        .optional(),

    ownerName: yup
        .string()
        .optional(),

    cardNumber: yup
        .string()
        .optional(),
})
export type TCreatePaymentChannelInput = yup.InferType<typeof CreatePaymentChannelSchema>

export const UpdatePaymentChannelInputSchema = CreatePaymentChannelSchema.partial()
export type TUpdatePaymentChannelInput = yup.InferType<typeof UpdatePaymentChannelInputSchema>