import dayjs, { Dayjs } from 'dayjs'
import queryString from 'query-string'

// --- Configuration ---
const QS_OPTIONS = {
    arrayFormat: 'comma' as const, // Support ?foo=1,2,3
    parseNumbers: false, // Parse manually for safety
    parseBooleans: false, // Parse manually for safety
    skipEmptyString: true,
    skipNull: true,
}

// --- 1. CORE PARSER ---

export const parseSearchParams = (
    params: string | URLSearchParams | null
) => {
    if (!params) return {}
    const stringParams = params.toString()
    return queryString.parse(stringParams, QS_OPTIONS)
}

// --- 2. TYPE-SAFE EXTRACTORS ---

/**
 * Extracts a string array.
 * @example ?status=OPEN,DONE -> ['OPEN', 'DONE']
 * @example ?status=OPEN      -> ['OPEN']
 * @example ?status=          -> []
 */
export const safeArray = (
    value: string | (string | null)[] | null | undefined
): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(Boolean) as string[]
    return [value as string]
}

/**
 * Extracts a Date string and ensures it is valid ISO 8601.
 * Useful for validating date filters from URL.
 * * @example safeDate("2023-01-01") -> "2023-01-01T00:00:00.000Z"
 * @example safeDate("invalid")    -> undefined
 */
export const safeISODate = (
    value: string | (string | null)[] | null | undefined
): string | undefined => {
    const str = safeString(value)
    if (!str) return undefined

    const date = new Date(str)
    // Check if date is "Invalid Date"
    if (isNaN(date.getTime())) return undefined

    return date.toISOString()
}

/**
 * Extracts a Date from URL and returns a Dayjs object.
 * Returns undefined if the date is invalid or missing.
 * * @example safeDate("2023-01-01") -> Dayjs object
 * @example safeDate("invalid")    -> undefined
 */
export const safeDayjs = (
    value: string | (string | null)[] | null | undefined
): Dayjs | undefined => {
    const str = safeString(value)
    if (!str) return undefined

    const date = dayjs(str)

    // dayjs().isValid() checks if the date is valid
    if (!date.isValid()) return undefined

    return date
}

/**
 * Extracts a Date object from the URL.
 * Returns undefined if the date is invalid or missing.
 */
export const safeDate = (
    value: string | (string | null)[] | null | undefined
): Date | undefined => {
    const str = safeString(value)
    if (!str) return undefined

    const date = new Date(str)

    // Check if date is "Invalid Date"
    if (isNaN(date.getTime())) return undefined

    return date
}

/**
 * Extracts a single string.
 * Uses the first value if duplicate params exist.
 */
export const safeString = (
    value: string | (string | null)[] | null | undefined
): string | undefined => {
    if (!value) return undefined
    if (Array.isArray(value)) return value[0] || undefined
    return value as string
}

/**
 * Extracts a number (Integer). Useful for Pagination (page, limit).
 * Returns 'fallback' if invalid.
 */
export const safeInt = (
    value: string | (string | null)[] | null | undefined,
    fallback: number
): number => {
    const str = safeString(value)
    if (!str) return fallback
    const num = parseInt(str, 10)
    return isNaN(num) ? fallback : num
}

/**
 * Extracts a floating-point number.
 * Uses parseFloat, so it handles decimals.
 * * @example safeFloat("10.5") -> 10.5
 * @example safeFloat("10.5px") -> 10.5
 */
export const safeFloat = (
    value: string | (string | null)[] | null | undefined,
    fallback: number
): number => {
    const str = safeString(value)
    if (!str) return fallback
    const num = parseFloat(str)
    return isFinite(num) ? num : fallback
}

/**
 * Extracts a strict number (integer or float).
 * Uses Number(), so it rejects strings with non-numeric characters.
 * * @example safeNumber("10.5") -> 10.5
 * @example safeNumber("10.5px") -> fallback (Strict)
 */
export const safeNumber = (
    value: string | (string | null)[] | null | undefined,
    fallback: number
): number => {
    const str = safeString(value)
    if (!str) return fallback
    const num = Number(str)
    return isFinite(num) ? num : fallback
}

/**
 * Extracts a Boolean.
 * Supports "true", "1", "yes" as true.
 */
export const safeBoolean = (
    value: string | (string | null)[] | null | undefined,
    fallback = false
): boolean => {
    const str = safeString(value)?.toLowerCase()
    if (!str) return fallback
    return ['true', '1', 'yes', 'on'].includes(str)
}

// --- 3. SERIALIZER (Object -> URL) ---

/**
 * Converts a filter object into a clean URL-ready object.
 * Handles arrays -> "comma,string"
 * Removes nulls/undefined/empty strings.
 */
export const toUrlParams = (data: Record<string, unknown>) => {
    const cleaned: Record<string, string | undefined> = {}

    Object.entries(data).forEach(([key, value]) => {
        // Skip empty
        if (value === undefined || value === null || value === '') return

        // Handle Arrays: ['A', 'B'] -> "A,B"
        if (Array.isArray(value)) {
            if (value.length > 0) {
                cleaned[key] = value.join(',')
            }
            return
        }

        // Handle Primitives
        cleaned[key] = String(value)
    })

    return cleaned
}
