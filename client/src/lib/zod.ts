import { z } from 'zod'

// Helper: Mimics the DTO @Transform for splitting comma-separated strings
// This allows the schema to handle both ?type=A,B (URL param) and ['A', 'B'] (Form state)
export const arrayToString = z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
        if (!val) return undefined
        if (Array.isArray(val)) return val.join(',')
        return val
    })

export const optionalIsoDate = z
    .string()
    .datetime({ message: 'Invalid ISO 8601 date' })
    .optional()
    .or(z.literal(''))


// --- Helper for Zod Validation (Same as before) ---
export const toFormikValidate = <T extends z.ZodType<any, any>>(schema: T) => {
    return (values: any) => {
        const result = schema.safeParse(values)
        if (!result.success) {
            const errors: Record<string, string> = {}
            result.error.issues.forEach((issue) => {
                const path = issue.path[0]
                if (path) errors[path.toString()] = issue.message
            })
            return errors
        }
        return {}
    }
}