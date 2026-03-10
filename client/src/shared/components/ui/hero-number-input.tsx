import { useMemo } from 'react'
import { extendVariants, NumberInput, NumberInputProps } from '@heroui/react'

/**
 * 1. Styled Base Component using extendVariants
 */
const StyledNumberInput = extendVariants(NumberInput, {
    variants: {
        variant: {
            minimal: {
                inputWrapper: [
                    'shadow-none',
                    'border-2',
                    'border-border-default',
                    '!bg-background',
                    'transition',
                    'duration-100',
                    'focus-within:border-primary',
                    'data-[hover=true]:border-primary',
                ],
                label: ['text-text-default', 'font-semibold'],
                input: [
                    'text-base',
                    'text-foreground',
                    'placeholder:text-default-subdued',
                ],
            },
        },
    },
    defaultVariants: {
        variant: 'minimal',
        labelPlacement: 'inside',
    },
})

/**
 * 2. Component Props Interface
 */
interface HeroNumberInputProps extends Omit<
    NumberInputProps,
    'value' | 'onValueChange'
> {
    value?: string | number | null
    onValueChange?: (val: number | null) => void
    allowNegative?: boolean
    notNull?: boolean
}

/**
 * 3. Functional Wrapper Component
 */
export const HeroNumberInput = ({
    value,
    onValueChange,
    allowNegative = true,
    notNull = false,
    ...props
}: HeroNumberInputProps) => {
    // Process the value to ensure it's a valid number and never 'NaN'
    const processedValue = useMemo(() => {
        // Handle empty or null cases
        if (value === undefined || value === null || value === '') {
            return notNull ? 0 : undefined
        }

        // Parse strings to numbers
        const parsed = typeof value === 'string' ? parseFloat(value) : value

        // If parsing fails (NaN), fallback based on notNull
        if (isNaN(parsed)) {
            return notNull ? 0 : undefined
        }

        return parsed
    }, [value, notNull])

    // Handle user input changes
    const handleChange = (val: number | null) => {
        if (!onValueChange) return

        let newValue = val

        // 1. Handle NaN safety from internal component state
        if (newValue !== null && isNaN(newValue)) {
            newValue = notNull ? 0 : null
        }

        // 2. Handle notNull logic (convert null to 0)
        if (notNull && newValue === null) {
            newValue = 0
        }

        // 3. Prevent negative values if allowNegative is false
        if (!allowNegative && newValue !== null && newValue < 0) {
            newValue = 0
        }

        onValueChange(newValue)
    }

    return (
        <StyledNumberInput
            {...props}
            value={processedValue}
            onValueChange={handleChange}
            // Sync the native min attribute for accessibility and stepper behavior
            minValue={!allowNegative ? 0 : props.minValue}
        />
    )
}

export default HeroNumberInput
