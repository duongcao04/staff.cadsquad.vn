import { isAfter, isValid, parseISO } from 'date-fns'
import * as yup from 'yup'
import { z, ZodType } from 'zod'
import { EJobPaymentStatus, ProjectCenterTabEnum } from '../../shared/enums'
import { TJob } from '../../shared/types'
import { ClientSchema } from './_client.schema'
import { JobActivityLogSchema } from './_job-activity-log.schema'
import { jobFiltersSchema } from './_job-filter.schema'
import { JobStatusSchema } from './_job-status.schema'
import { JobTypeSchema } from './_job-type.schema'
import { PaymentChannelSchema } from './_payment-channel.schema'
import { UserSchema } from './_user.schema'
import { JobFolderTemplateSchema } from './_job-folder-template.schema'
import { SharepointItemSchema } from './_sharepoint-item.schema'
import { IMAGES } from '../utils'
import { optimizeCloudinary } from '../cloudinary'

export const JobSchema: ZodType<TJob> = z.lazy(
    () =>
        z.object({
            id: z.string().catch('N/A'),
            no: z.string().catch('UNKNOWN'),
            displayName: z.string().catch('Untitled Job'),
            assignments: z
                .array(
                    z.object({
                        id: z.string().nullish(),
                        jobId: z.string().nullish(),
                        userId: z.string().nullish(),
                        staffCost: z.coerce.number().nullish(),
                        assignedAt: z.coerce.date().nullish(),
                        user: z
                            .object({
                                id: z.string().nullish(),
                                displayName: z.string().nullish(),
                                userName: z.string().nullish(),
                                code: z.string().nullish(),
                                avatar: z
                                    .string()
                                    .nullish()
                                    .default(IMAGES.emptyAvatar)
                                    .transform((val) => {
                                        if (!val) return IMAGES.emptyAvatar
                                        return optimizeCloudinary(val)
                                    }),
                            })
                            .nullish(),
                    })
                )
                .default([]),
            activityLog: z
                .array(z.lazy(() => JobActivityLogSchema))
                .default([]),
            attachmentUrls: z.array(z.string()).default([]),
            createdBy: z.lazy(() => UserSchema).optional(),
            files: z.array(z.any()).default([]),
            client: z
                .lazy(() => ClientSchema.partial())
                .nullable()
                .catch(null),
            comments: z.array(z.any()).default([]),
            jobDeliveries: z.array(z.any()).default([]),
            sharepointFolderId: z.string().nullish(),
            sharepointFolder: z.lazy(() => SharepointItemSchema).nullish(),
            // Tự động ép kiểu số cho các trường tiền tệ
            incomeCost: z.coerce.number().catch(0),
            staffCost: z.coerce.number().catch(0),
            folderTemplate: z
                .lazy(() => JobFolderTemplateSchema)
                .nullable()
                .catch(null),
            folderTemplateId: z.string().nullable().catch(null),
            totalStaffCost: z.coerce.number().catch(0),
            paymentStatus: z
                .nativeEnum(EJobPaymentStatus)
                .optional()
                .default(EJobPaymentStatus.FAILED),
            isPinned: z.preprocess(
                (v) => Boolean(v),
                z.boolean().default(false)
            ),
            isPublished: z.preprocess(
                (v) => Boolean(v),
                z.boolean().default(false)
            ),
            paymentChannel: z
                .lazy(() => PaymentChannelSchema)
                .nullable()
                .catch(null),
            status: z.lazy(() => JobStatusSchema).optional(),
            description: z.string().nullable().catch(null),
            type: z.lazy(() => JobTypeSchema).optional(),
            // Dates
            payoutDate: z.coerce.date().nullable().catch(null),
            finishedAt: z.coerce.date().nullable().catch(null),
            createdAt: z.coerce.date().catch(new Date()),
            dueAt: z.coerce.date().catch(new Date()),
            completedAt: z.coerce.date().nullable().catch(null),
            deletedAt: z.coerce.date().nullable().catch(null),
            startedAt: z.coerce.date().catch(new Date()),
            updatedAt: z.coerce.date().catch(new Date()),
        }) as any
)

// 1. Define the base object WITHOUT refinements
const BaseJobFormSchema = z.object({
    no: z.string('Job number is required').min(1, 'Job number is required'),
    typeId: z
        .string()
        .uuid('Invalid typeId format')
        .min(1, 'Job type is required'),
    displayName: z
        .string('Display name is required')
        .min(1, 'Display name is required'),
    description: z.string().optional(),
    attachmentUrls: z.array(z.string()).default([]),
    clientId: z.string().optional(),
    clientName: z
        .string('Client name is required')
        .min(1, 'Client name is required'),
    incomeCost: z.coerce
        .number({ message: 'Income cost must be a number' })
        .min(1, 'Income cost must be greater than 1'),
    totalStaffCost: z.coerce
        .number({ message: 'Total staff cost must be a number' })
        .optional()
        .default(0),
    jobAssignments: z
        .array(
            z.object({
                userId: z.string().min(1, 'User ID is required'),
                staffCost: z.coerce
                    .number({ message: 'Member cost must be a number' })
                    .min(1, 'Member cost must greater than 1'),
            })
        )
        .min(1, 'At least one member is required'),
    paymentChannelId: z.string().uuid('Invalid Payment Channel').nullish(),
    startedAt: z
        .string()
        .min(1, 'Started at is required')
        .refine(
            (val) => isValid(parseISO(val)),
            'Date must be a valid ISO string'
        ),
    dueAt: z
        .string()
        .min(1, 'Due date is required')
        .refine(
            (val) => isValid(parseISO(val)),
            'Date must be a valid ISO string'
        ),
    folderTemplateId: z.string().nullish(),
    isCreateSharepointFolder: z.boolean().default(false),
    sharepointTemplateId: z.string().nullish(),
    sharepointFolderId: z.string().nullish(),
    useExistingSharepointFolder: z.boolean().default(false),
})

// 2. Export the CREATE schema (with refinements attached)
export const CreateJobFormSchema = BaseJobFormSchema.refine(
    (data) => {
        if (!data.startedAt || !data.dueAt) return true
        const start = parseISO(data.startedAt)
        const end = parseISO(data.dueAt)
        return isValid(start) && isValid(end) && isAfter(end, start)
    },
    { message: 'Due date must be after start date', path: ['dueAt'] }
)
    // require template when user creates a new SP folder
    .refine(
        (data) =>
            !(data.isCreateSharepointFolder && !data.sharepointTemplateId),
        {
            message: 'Folder template is required',
            path: ['sharepointTemplateId'],
        }
    )
    // ensure user does not both create and select existing at same time
    .refine(
        (data) =>
            !(
                data.isCreateSharepointFolder &&
                data.useExistingSharepointFolder
            ),
        {
            message: 'Cannot create and pick existing folder simultaneously',
            path: ['useExistingSharepointFolder'],
        }
    )
    // when existing mode is enabled, require folder id
    .refine(
        (data) =>
            !(data.useExistingSharepointFolder && !data.sharepointFolderId),
        {
            message: 'Please select an existing folder',
            path: ['sharepointFolderId'],
        }
    )

export type TCreateJobFormValues = z.infer<typeof CreateJobFormSchema>

// 3. Export the UPDATE schema (using .partial() on the BASE schema)
export const UpdateJobSchema = BaseJobFormSchema.partial()

// Use z.infer instead of yup.InferType
export type TUpdateJobInput = z.infer<typeof UpdateJobSchema>

export const UpdateJobRevenueSchema = yup.object({
    incomeCost: yup.number().optional(),
    paymentChannelId: yup
        .string()
        .uuid('Invalid paymentChannelId format')
        .optional(),
})

export type TUpdateJobRevenue = yup.InferType<typeof UpdateJobRevenueSchema>

export const AssignMemberSchema = yup.object({
    staffCost: yup
        .number()
        .min(0, 'Cost must be greater than 0 VND.')
        .required('Staff cost is required'),
    memberId: yup
        .string()
        .uuid('Invalid memberId format')
        .required('Member is required'),
})

export type TAssignMember = yup.InferType<typeof AssignMemberSchema>

// ---------------------------------------------------------------
// QUERY SCHEMAS
// ---------------------------------------------------------------

// 2. JobSortSchema
export const JobSortSchema = z.object({
    sort: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .default(['displayName:asc'])
        .transform((val) => {
            if (Array.isArray(val)) return val
            return val ? val.split(',') : ['displayName:asc']
        }),
})

// 3. JobQuerySchema (Combines Filters, Sorts, and Base Query)
export const JobQuerySchema = jobFiltersSchema.merge(JobSortSchema).extend({
    tab: z
        .nativeEnum(ProjectCenterTabEnum)
        .optional()
        .default(ProjectCenterTabEnum.ACTIVE),

    search: z.string().trim().optional(),

    isAll: z.enum(['0', '1']).optional().default('0'),

    // Pagination (Using coerce to handle URL query string numbers)
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),

    page: z.coerce.number().int().min(1).optional().default(1),
})

// Types inferred from Schemas (Optional, but useful for frontend type safety)
export type TJobQueryInput = z.input<typeof JobQuerySchema> // Raw input (e.g. from URLSearchParams)
export type TJobQueryOutput = z.output<typeof JobQuerySchema> // Transformed output (e.g. ready for API call)

// ---------------------------------------------------------------
// MUTATION SCHEMAS
// ---------------------------------------------------------------

export const BulkChangeStatusInputSchema = z.object({
    jobIds: z.array(z.string()).min(1, 'jobIds must contain at least one id'),
    toStatusId: z.string().min(1, 'toStatusId is required'),
})

export type TBulkChangeStatusInput = z.infer<typeof BulkChangeStatusInputSchema>

export const UpdateJobMembersSchema = yup.object({
    prevMemberIds: yup.string().required(),
    updateMemberIds: yup.string().required(),
})
export type TUpdateJobMembersInput = yup.InferType<
    typeof UpdateJobMembersSchema
>

export const RescheduleJobSchema = yup.object({
    fromDate: yup.string().required(),
    toDate: yup.string().required(),
})
export type TRescheduleJob = yup.InferType<typeof RescheduleJobSchema>

export const DeliverJobInputSchema = z.object({
    jobId: z
        .string({ message: 'Please select a job to deliver' })
        .min(1, 'Please select a job to deliver'),

    note: z
        .string({ message: 'Note cannot be empty' })
        .min(1, 'Note cannot be empty')
        .max(1000, 'Note is too long (max 1000 characters)'),

    files: z
        .array(
            z.object({
                webUrl: z.string().url('Each attachment must be a valid URL'),
                fileName: z.string(),
                sharepointId: z.string(),
            })
        )
        .default([]),
})

// Type inference (Tương đương InferType của Yup)
export type TDeliverJobInput = z.infer<typeof DeliverJobInputSchema>

export const JobPayoutSchema = z.lazy(() =>
    z.object({
        id: z.string().catch('N/A'),
        no: z.string().catch('UNKNOWN'),
        displayName: z.string().catch('Untitled Job'),
        assignments: z.array(z.any()).default([]),
        attachmentUrls: z.array(z.string()).default([]),
        createdBy: z.lazy(() => UserSchema).optional(),
        client: z
            .lazy(() => ClientSchema.partial())
            .nullable()
            .catch(null),
        jobDeliveries: z.array(z.any()).default([]),
        sharepointFolderId: z.string().nullish(),
        sharepointFolder: z.lazy(() => SharepointItemSchema).nullish(),
        // Tự động ép kiểu số cho các trường tiền tệ
        incomeCost: z.coerce.number().catch(0),
        staffCost: z.coerce.number().catch(0),
        folderTemplate: z
            .lazy(() => JobFolderTemplateSchema)
            .nullable()
            .catch(null),
        folderTemplateId: z.string().nullable().catch(null),
        totalStaffCost: z.coerce.number().catch(0),
        paymentStatus: z
            .nativeEnum(EJobPaymentStatus)
            .optional()
            .default(EJobPaymentStatus.FAILED),
        paymentChannel: z
            .lazy(() => PaymentChannelSchema)
            .nullable()
            .catch(null),
        status: z.lazy(() => JobStatusSchema).optional(),
        description: z.string().nullable().catch(null),
        type: z.lazy(() => JobTypeSchema).optional(),
        // Dates
        payoutDate: z.coerce.date().nullable().catch(null),
        finishedAt: z.coerce.date().nullable().catch(null),
        createdAt: z.coerce.date().catch(new Date()),
        dueAt: z.coerce.date().catch(new Date()),
        completedAt: z.coerce.date().nullable().catch(null),
        deletedAt: z.coerce.date().nullable().catch(null),
        startedAt: z.coerce.date().catch(new Date()),
        updatedAt: z.coerce.date().catch(new Date()),
    })
)

export type TJobPayoutDetail = z.infer<typeof JobPayoutSchema>

/**
 * Schema bổ sung cho thông tin tài chính chi tiết của Job
 */
export const JobFinancialFieldSchema = z.object({
    totalPaid: z.coerce.number().default(0),
    remainingAmount: z.coerce.number().default(0),
    isPartiallyPaid: z.preprocess(
        (v) => Boolean(v),
        z.boolean().default(false)
    ),
})

/**
 * JobReceivableSchema: Kết hợp JobSchema gốc với field financial
 * Dùng cho các query liệt kê công nợ khách hàng
 */
export const JobReceivableSchema = (JobSchema as any)._def.getter().extend({
    financial: JobFinancialFieldSchema,
})

// Loại bỏ type inference nếu cần
export type TJobReceivable = z.infer<typeof JobReceivableSchema>
