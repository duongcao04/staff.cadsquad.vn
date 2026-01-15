import {
    Button,
    ButtonProps,
    extendVariants,
    TooltipProps,
} from '@heroui/react'
import React from 'react'
import { HeroTooltip } from './hero-tooltip'

const StyledButton = extendVariants(Button, {
    variants: {
        // We override/extend the 'color' variant
        color: {
            // 1. Blue (Info) - Custom variant
            blue: 'bg-blue-500 text-white hover:shadow-xs shadow-lg shadow-blue-500/40 data-[hover=true]:bg-blue-600',

            // 2. Warning - Custom styling or override
            warning:
                'bg-orange-500 text-white hover:shadow-xs shadow-lg shadow-orange-500/40 data-[hover=true]:bg-orange-600',

            // 3. Danger - Custom styling or override
            danger: 'bg-red-500 text-white hover:shadow-xs shadow-lg shadow-danger/20 data-[hover=true]:bg-red-600',

            // 4. Success - Custom styling or override
            success:
                'bg-green-500 text-white hover:shadow-xs shadow-lg shadow-green-500/40 data-[hover=true]:bg-green-600',
        },
        size: {
            xs: 'px-2 min-w-6 h-6 text-tiny gap-1 rounded-small',
        },
    },
    defaultVariants: {
        color: 'default', // Set default to our new custom variant
    },
})

type HeroButtonProps = Omit<ButtonProps, 'color' | 'size'> & {
    size?: 'xs' | 'sm' | 'md' | 'lg'
    color?:
        | 'success'
        | 'default'
        | 'warning'
        | 'primary'
        | 'secondary'
        | 'danger'
        | 'blue'
    tooltip?: React.ReactNode
    tooltipProps?: TooltipProps
}
export const HeroButton = (props: HeroButtonProps) => {
    const button = <StyledButton {...props} />
    if (props.tooltip) {
        return (
            <HeroTooltip content={props.tooltip} {...props.tooltipProps}>
                <StyledButton {...props} />
            </HeroTooltip>
        )
    }
    return button
}
