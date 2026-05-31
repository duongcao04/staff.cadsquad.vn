import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardProps,
    extendVariants,
} from '@heroui/react'

const StyledCard = extendVariants(Card, {
    variants: {
        // We define a new custom variant prop called "heroStyle"
        heroStyle: {
            cinematic: {
                base: 'w-full bg-background border border-default-200 shadow-xs px-1 py-0.5',
                header: 'gap-1.5 tracking-wide text-text-subdued font-medium ',
                footer: 'flex items-center justify-end gap-2', // Glass effect preparation
            },
            modern: {
                base: 'w-full p-8 bg-gradient-to-tr from-slate-900 to-slate-800 border-slate-700',
                header: 'pb-4 flex-col items-start',
                body: 'py-6 text-slate-300 text-lg',
                footer: 'pt-4 flex gap-4',
            },
            default: {
                base: 'dark:bg-background-muted',
            },
        },
    },
    defaultVariants: {
        heroStyle: 'cinematic', // Default behavior
        radius: 'sm',
    },
})
type HeroCardProps = CardProps & {
    heroStyle?: 'cinematic' | 'default'
}
export const HeroCard = (props: HeroCardProps) => {
    const card = (
        <StyledCard {...props} heroStyle={props.heroStyle ?? 'default'} />
    )
    return card
}

export {
    CardBody as HeroCardBody,
    CardFooter as HeroCardFooter,
    CardHeader as HeroCardHeader,
}
