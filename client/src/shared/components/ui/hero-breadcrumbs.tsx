'use client'

import { BreadcrumbItem, Breadcrumbs, extendVariants } from '@heroui/react'

export const HeroBreadcrumbs = extendVariants(Breadcrumbs, {
    variants: {
        // 1. Custom Colors
        // We target the 'item' (specifically the active one) and the 'separator'
        color: {
            blue: {
                item: 'data-[current=true]:text-blue-500 data-[current=true]:font-semibold hover:text-blue-400',
                separator: 'text-blue-300/50',
            },
            warning: {
                item: 'data-[current=true]:text-orange-500 data-[current=true]:font-semibold hover:text-orange-400',
                separator: 'text-orange-300/50',
            },
            danger: {
                item: 'data-[current=true]:text-red-500 data-[current=true]:font-semibold hover:text-red-400',
                separator: 'text-red-300/50',
            },
            success: {
                item: 'data-[current=true]:text-green-500 data-[current=true]:font-semibold hover:text-green-400',
                separator: 'text-green-300/50',
            },
        },

        // 2. Custom Sizes
        size: {
            xs: {
                list: 'gap-1',
                item: 'text-[10px]', // Matches HeroChip/HeroButton xs text
                separator: 'text-[10px] px-0.5',
            },
        },
    },
    defaultVariants: {
        color: 'foreground', // Default to standard gray/black if not specified
        size: 'md',
    },
})

// Re-export BreadcrumbItem for convenience
export { BreadcrumbItem as HeroBreadcrumbItem }
