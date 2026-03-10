import { Autocomplete, AutocompleteItem, extendVariants } from '@heroui/react'

export const HeroAutocomplete = extendVariants(Autocomplete, {
    variants: {
        variant: {
            bordered: {
                base: ['w-full', 'font-semibold!','hover:border-primary!'],
                listboxWrapper: ['max-h-[320px]'],
                selectorButton: ['text-default-500'],
                inputWrapper: [
                    'shadow-none',
                    'border-2',
                    'border-text-muted',
                    '!bg-background',
                    'transition',
                    'duration-100',
                    'focus-within:border-primary!',
                    'data-[hover=true]:border-primary!',
                    "hover:border-primary!"
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
