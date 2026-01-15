'use client'

import { Autocomplete, AutocompleteItem, extendVariants } from '@heroui/react'

export const HeroAutocomplete = extendVariants(Autocomplete, {
    variants: {
        variant: {
            bordered: {
                base: ['w-full', 'font-medium!'],
                listboxWrapper: ['max-h-[320px]'],
                selectorButton: ['text-default-500'],
                inputWrapper: [
                    'shadow-none',
                    'border',
                    'border-text-muted',
                    '!bg-background',
                    'transition',
                    'duration-100',
                    'focus-within:border-primary',
                    'data-[hover=true]:border-primary',
                ],
            },
        },
    },
    defaultVariants: {
        variant: 'bordered',
        labelPlacement: 'outside-top',
    },
})
export { AutocompleteItem as HeroAutocompleteItem }
