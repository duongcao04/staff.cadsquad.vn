import { isAfter, isValid, parseISO } from 'date-fns'
import * as yup from 'yup'
import { z } from 'zod'

import { ProjectCenterTabEnum } from '../../shared/enums'
import { jobFiltersSchema } from './_job-filter.schema'

export const CreateJobSchema = yup.object({
    no: yup.string().required('Job number is required'),
    typeId: yup
        .string()
        .uuid('Invalid typeId format')
        .required('Job type is required'),
    displayName: yup.string().required('Display name is required'),
    description: yup.string().optional(),

    // Arrays should default to empty arrays to match DTO logic
    attachmentUrls: yup.array().of(yup.string().required()).default([]),

    clientName: yup.string().required('Client name is required'),

    // Cost fields: In DTO they are strings (from input) but validated as numbers here
    incomeCost: yup
        .number()
        .min(1, 'Income must be greater than $1')
        .typeError('Income cost must be a number')
        .required('Income cost is required'),

    totalStaffCost: yup
        .number()
        .typeError('Total staff cost must be a number')
        .optional()
        .default(0),

    jobAssignments: yup
        .array()
        .of(
            yup.object({
                userId: yup.string().required('User ID is required'),
                staffCost: yup
                    .number()
                    .typeError('Staff cost must be a number')
                    .required(),
            })
        )
        .min(1, 'At least one member is required')
        .required(),

    paymentChannelId: yup.string().uuid().nullable().optional(),

    startedAt: yup
        .string()
        .required('Started at is required')
        .test('is-iso-string', 'Date must be a valid ISO string', (value) => {
            return !value || isValid(parseISO(value))
        }),

    dueAt: yup
        .string()
        .required('Due date is required')
        .test('is-iso-string', 'Date must be a valid ISO string', (value) => {
            return !value || isValid(parseISO(value))
        })
        .test(
            'is-after-start',
            'Due date must be after start date',
            function (value) {
                const { startedAt } = this.parent
                if (!value || !startedAt) return true
                const start = parseISO(startedAt)
                const end = parseISO(value)
                return isValid(start) && isValid(end) && isAfter(end, start)
            }
        ),
})

export type TCreateJobInput = yup.InferType<typeof CreateJobSchema>

export const UpdateJobSchema = CreateJobSchema.partial()
export type TUpdateJobInput = yup.InferType<typeof UpdateJobSchema>

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

    hideFinishItems: z.enum(['0', '1']).optional().default('0'),

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

export const DeliverJobInputSchema = yup.object({
    jobId: yup.string().required('Please select a job to deliver'),

    note: yup
        .string()
        .max(1000, 'Note is too long (max 1000 characters)')
        .optional(),

    link: yup
        .string()
        .url('Link must be a valid URL (e.g., https://figma.com/...)')
        .optional()
        .nullable(), // Handle cases where form value might be null

    files: yup
        .array()
        .of(yup.string().required()) // Ensures every item in the array is a string
        // Uncomment the line below to strictly validate URLs for files, matching your commented decorator:
        // .of(yup.string().url('Each attachment must be a valid URL').required())
        .optional()
        .default([]),
})

// Type inference for usage in React Hook Form / Formik
export type TDeliverJobInput = yup.InferType<typeof DeliverJobInputSchema>
