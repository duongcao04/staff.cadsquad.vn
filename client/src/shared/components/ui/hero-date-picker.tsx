import {
    DatePicker,
    type DatePickerProps,
    DateRangePicker,
    type DateRangePickerProps,
    type DateValue,
    type RangeValue,
} from '@heroui/react'
import { CalendarDate } from '@internationalized/date'
import dayjs, { Dayjs } from 'dayjs'
import { X } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '../../../lib/utils'
import { HeroButton } from './hero-button'

// --- Utility Functions: Dayjs <-> Internationalized/date ---
interface BaseProps {
    /** * Optional format string (e.g., "YYYY-MM-DD").
     * If provided, the onChange event will return a string.
     * If undefined, it returns a Dayjs object.
     */
    format?: string
}

/**
 * Converts a Dayjs object (or string) to a HeroUI DateValue.
 * Handles TimeZone conversion if necessary.
 */
const dayjsToHeroDate = (
    date: Dayjs | string | null | undefined
): DateValue | null | undefined => {
    if (!date) return null

    const d = dayjs(date)
    if (!d.isValid()) return null

    // Format to standard ISO string to parse safely
    // const isoString = d.format('YYYY-MM-DD')

    // Return simple CalendarDate (Year, Month, Day)
    // If you need time support (hours/minutes), use parseAbsoluteToLocal(d.toISOString()) instead
    return new CalendarDate(d.year(), d.month() + 1, d.date())
}

/**
 * Converts a HeroUI DateValue back to a Dayjs object.
 */
const heroDateToDayjs = (date: DateValue): Dayjs => {
    // @internationalized/date objects have .year, .month, .day
    // Note: Dayjs months are 0-indexed (0=Jan), HeroUI is 1-indexed (1=Jan)
    return (
        dayjs()
            .year(date.year)
            .month(date.month - 1)
            .date(date.day)
            // Reset time to start of day if it's just a Date picker
            .startOf('day')
    )
}

// --- Types ---

// Override 'value', 'defaultValue', and 'onChange' to support Dayjs
type HeroDatePickerProps = Omit<
    DatePickerProps,
    'value' | 'defaultValue' | 'onChange'
> &
    BaseProps & {
        value?: Dayjs | string | null
        defaultValue?: Dayjs | string | null
        onChange?: (date: Dayjs | null) => void
    }

export type HeroDateRangePickerProps = Omit<
    DateRangePickerProps,
    'value' | 'defaultValue' | 'onChange'
> & {
    value?: { start: Dayjs | string; end: Dayjs | string } | null
    defaultValue?: { start: Dayjs | string; end: Dayjs | string } | null
    onChange?: (range: { start: Dayjs; end: Dayjs } | null) => void
    isClearable?: boolean
}

// --- Components ---

export const HeroDatePicker = ({
    value,
    defaultValue,
    onChange,
    ...props
}: HeroDatePickerProps) => {
    // Convert incoming Dayjs/String props to HeroUI format
    const parsedValue = useMemo(() => dayjsToHeroDate(value), [value])
    const parsedDefaultValue = useMemo(
        () => dayjsToHeroDate(defaultValue),
        [defaultValue]
    )

    const handleChange = (date: DateValue | null) => {
        if (!onChange) return
        if (!date) {
            onChange(null)
            return
        }
        onChange(heroDateToDayjs(date))
    }

    return (
        <DatePicker
            {...props}
            value={parsedValue}
            defaultValue={parsedDefaultValue}
            onChange={handleChange}
        />
    )
}

export const HeroDateRangePicker = ({
    value,
    defaultValue,
    onChange,
    isClearable = false,
    ...props
}: HeroDateRangePickerProps) => {
    // Helper to parse range objects
    const parseRange = (
        val: { start: Dayjs | string; end: Dayjs | string } | null | undefined
    ) => {
        if (!val?.start || !val?.end) return null
        return {
            start: dayjsToHeroDate(val.start)!,
            end: dayjsToHeroDate(val.end)!,
        }
    }

    const parsedValue = useMemo(() => parseRange(value), [value])
    const parsedDefaultValue = useMemo(
        () => parseRange(defaultValue),
        [defaultValue]
    )

    const handleChange = (range: RangeValue<DateValue> | null) => {
        if (!onChange) return
        if (!range) {
            onChange(null)
            return
        }
        onChange({
            start: heroDateToDayjs(range.start),
            end: heroDateToDayjs(range.end),
        })
    }

    return (
        <DateRangePicker
            {...props}
            value={parsedValue}
            defaultValue={parsedDefaultValue}
            onChange={handleChange}
            selectorButtonPlacement={isClearable ? 'start' : 'end'}
            endContent={
                isClearable && parsedValue ? (
                    <HeroButton
                        size="xs"
                        isIconOnly
                        className="w-6! px-0!"
                        variant="light"
                        color="default"
                        onPress={() => handleChange(null)}
                    >
                        <X size={14} />
                    </HeroButton>
                ) : undefined
            }
            classNames={{
                label: cn(
                    'font-medium! text-sm! text-text-default',
                    props.classNames?.label
                ),
                ...props.classNames,
            }}
        />
    )
}
