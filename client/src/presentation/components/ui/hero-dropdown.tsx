'use client'

import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownProps,
    DropdownSection,
    DropdownTrigger,
    extendVariants,
} from '@heroui/react'

export const StyledDropdown = extendVariants(Dropdown, {
    variants: {
        // 1. Tạo variant "appearance" để chỉnh style khung menu
        appearance: {
            clean: {
                content:
                    'p-1 border border-default-200 bg-background shadow-lg rounded-xl',
            },
            glass: {
                content:
                    'p-1 bg-background/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl',
            },
            flat: {
                content:
                    'p-0 border border-default-100 shadow-sm rounded-lg bg-default-50',
            },
        },
    },
    defaultVariants: {
        appearance: 'clean',
    },
})

// Wrapper Component để inject Motion Props
export const HeroDropdown = (props: DropdownProps) => {
    return (
        <StyledDropdown
            {...props}
            motionProps={{
                variants: {
                    enter: {
                        x: 0,
                        opacity: 1,
                        transition: {
                            duration: 0.08,
                            ease: 'easeIn',
                        },
                    },
                    exit: {
                        x: 20,
                        opacity: 0,
                        transition: {
                            duration: 0.08,
                            ease: 'easeOut',
                        },
                    },
                },
            }}
        />
    )
}

export {
    DropdownItem as HeroDropdownItem,
    DropdownMenu as HeroDropdownMenu,
    DropdownSection as HeroDropdownSection,
    DropdownTrigger as HeroDropdownTrigger,
}
