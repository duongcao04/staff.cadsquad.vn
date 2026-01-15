'use client'

import { Chip, extendVariants } from '@heroui/react'

export const HeroChip = extendVariants(Chip, {
    variants: {
        // 1. Custom Colors (Matching HeroButton palette)
        color: {
            blue: {
                base: 'bg-blue-500 text-white',
                content: 'font-medium',
            },
            warning: {
                base: 'bg-orange-500 text-white',
                content: 'font-medium',
            },
            danger: {
                base: 'bg-red-500 text-white',
                content: 'font-medium',
            },
            success: {
                base: 'bg-green-500 text-white',
                content: 'font-medium',
            },
        },

        // 2. Custom Size
        size: {
            xs: {
                base: 'h-5 min-h-5 px-1 text-[10px] gap-1',
                content: 'px-1',
                avatar: 'w-3 h-3',
            },
        },
    },
    defaultVariants: {
        color: 'default', // Default standard color
    },
})
