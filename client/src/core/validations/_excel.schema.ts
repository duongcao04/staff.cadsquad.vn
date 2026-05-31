import { z } from 'zod'

// Define the shape of a single column
export const excelColumnSchema = z.object({
    header: z.string().min(1, 'Header is required'),
    key: z.string().min(1, 'Key is required'),
    width: z.number().optional(),
})

// Define the main download input schema
export const downloadExcelSchema = z.object({
    columns: z
        .array(excelColumnSchema)
        .min(1, 'At least one column is required'),
    // We use z.record(z.any()) because 'data' rows are dynamic objects
    data: z.array(z.record(z.string(), z.any())).min(1, 'Data cannot be empty'),
})

// Infer the TypeScript type from the schema
export type TDownloadExcelInput = z.infer<typeof downloadExcelSchema>
