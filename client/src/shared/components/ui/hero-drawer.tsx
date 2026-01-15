import {
    Drawer,
    DrawerBody,
    DrawerBodyProps,
    DrawerContent,
    DrawerContentProps,
    DrawerFooter,
    DrawerHeader,
    DrawerHeaderProps,
    DrawerProps,
    extendVariants,
} from '@heroui/react'

const StyledDrawer = extendVariants(Drawer, {
    variants: {
        // We define a new custom variant prop called "heroStyle"
        variant: {
            cinematic: {
                base: 'm-2! rounded-md!',
                body: 'px-3! py-2!',
                footer: 'w-full!',
            },
        },
    },
    defaultVariants: {
        variant: 'cinematic', // Default behavior
        radius: 'sm',
    },
})

// Wrapper Component để inject Motion Props
export const HeroDrawer = (props: DrawerProps) => {
    return (
        <StyledDrawer
            style={{
                zIndex: '9999999 !important',
            }}
            {...props}
            motionProps={props.motionProps}
        />
    )
}

export const HeroDrawerContent = (props: DrawerContentProps) => {
    return (
        <DrawerContent
            {...props}
            style={{
                zIndex: '9999999 !important',
            }}
        />
    )
}

export const HeroDrawerHeader = (props: DrawerHeaderProps) => {
    return (
        <DrawerHeader
            {...props}
            style={{
                zIndex: '9999999 !important',
            }}
        />
    )
}

export const HeroDrawerBody = (props: DrawerBodyProps) => {
    return (
        <DrawerBody
            {...props}
            style={{
                zIndex: '9999999 !important',
            }}
        />
    )
}
export const HeroDrawerFooter = (props: DrawerBodyProps) => {
    return (
        <DrawerFooter
            {...props}
            style={{
                zIndex: '9999999 !important',
            }}
        />
    )
}
