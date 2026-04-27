import * as yup from 'yup'
import { z, ZodType } from 'zod'
import { TJobStatus } from '../../shared/types'
import { JobStatusSystemTypeEnum } from '../../shared/enums'
import { COLORS, IMAGES } from '../utils'
import { JobSchema } from './_job.schema'
import { optimizeCloudinary } from '../cloudinary'

export const JobStatusSchema: ZodType<TJobStatus> = z.lazy(() =>
    z.object({
        // Sử dụng .catch() để "rào" nếu id bị null/undefined/sai kiểu
        id: z.string().catch('N/A'),

        code: z.string().catch('UNKNOWN'),

        displayName: z.string().catch('Unknown status'),

        hexColor: z.string().default(COLORS.white),

        // Ép kiểu Enum, nếu sai thì lấy giá trị mặc định STANDARD
        systemType: z
            .nativeEnum(JobStatusSystemTypeEnum)
            .catch(JobStatusSystemTypeEnum.STANDARD),

        // Đảm bảo luôn là mảng
        jobs: z.array(z.lazy(() => JobSchema)).default([]),

        order: z.number().default(0),

        // Cho phép null
        icon: z.string().nullable().catch(null),

        nextStatusOrder: z.number().nullable().catch(null),

        prevStatusOrder: z.number().nullable().catch(null),

        thumbnailUrl: z
            .string()
            .default(IMAGES.cadsquadLogoOrange)
            .transform((val) => {
                if (!val) return IMAGES.cadsquadLogoOrange
                return optimizeCloudinary(val)
            }),

        // Tự động convert string -> Date, nếu lỗi thì lấy ngày hiện tại
        createdAt: z.coerce.date().catch(new Date()),

        updatedAt: z.coerce.date().catch(new Date()),
    })
)

export const CreateJobStatusInputSchema = yup.object({
    displayName: yup.string().required('Display name is required'),
    thumbnailUrl: yup.string().url().optional(),
    hexColor: yup
        .string()
        .matches(/^#([0-9A-Fa-f]{6})$/, 'Must be a valid hex color')
        .required('Hex color is required'),
    order: yup.number().integer().required('Order is required'),
    code: yup.string().optional(),
    icon: yup.string().optional(),
    nextStatusOrder: yup.number().integer().optional(),
    prevStatusOrder: yup.number().integer().optional(),
})
export type TCreateJobStatusInput = yup.InferType<
    typeof CreateJobStatusInputSchema
>

export const changeStatusInputSchema = z.object({
    // Code of current status
    currentStatus: z.string(),
    // Code of new target status
    newStatus: z.string(),
})
export type TChangeStatusInput = z.infer<typeof changeStatusInputSchema>

export const UpdateJobStatusInputSchema = CreateJobStatusInputSchema.partial()
export type TUpdateJobStatusInput = yup.InferType<
    typeof UpdateJobStatusInputSchema
>
