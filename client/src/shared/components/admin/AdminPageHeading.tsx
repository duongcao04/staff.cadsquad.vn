import { cn } from '@/lib'
import { Badge, CardBody, CardProps } from '@heroui/react'
import { HeroCard } from '../ui/hero-card'

type Props = {
    title: React.ReactNode
    description?: React.ReactNode
    showBadge?: boolean
    badgeCount?: number
    actions?: React.ReactNode
    classNames?: {
        wrapper?: string
        base?: string
        titleWrapper?: string
        title?: string
        description?: string
    }
    isSticky?: boolean
} & Omit<CardProps, 'title'>
export function AdminPageHeading({
    title,
    description,
    showBadge = false,
    badgeCount = 0,
    actions,
    classNames,
    isSticky = false,
    ...props
}: Props) {
    let titleComp = (
        <div
            className={cn(
                'text-2xl font-bold text-text-default',
                classNames?.title
            )}
        >
            {title as React.ReactNode}
        </div>
    )
    if (showBadge) {
        titleComp = (
            <Badge
                content={badgeCount > 99 ? '99+' : badgeCount}
                size="lg"
                color="primary"
                variant="flat"
                classNames={{
                    badge: 'right-0 top-0 text-[10px]! font-bold!',
                }}
            >
                <div
                    className={cn(
                        'text-2xl font-bold text-text-default',
                        classNames?.title
                    )}
                >
                    {title}
                </div>
            </Badge>
        )
    }
    return (
        <HeroCard
            {...props}
            shadow={props.shadow ?? 'none'}
            className={cn(
                'border border-border-default my-4 bg-background! dark:bg-background-hovered/40',
                isSticky && 'sticky top-0 z-30',
                classNames?.wrapper
            )}
        >
            <CardBody
                className={cn(
                    'flex flex-row justify-between items-center px-6 py-5',
                    classNames?.base
                )}
            >
                <div className={cn(classNames?.titleWrapper)}>
                    {titleComp}
                    <p
                        className={cn(
                            'text-sm text-text-subdued',
                            classNames?.description
                        )}
                    >
                        {description}
                    </p>
                </div>
                <>{actions}</>
            </CardBody>
        </HeroCard>
    )
}
