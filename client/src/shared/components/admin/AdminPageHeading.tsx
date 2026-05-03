import { cn } from '@/lib'
import { Badge, Button, Card, CardBody, CardProps } from '@heroui/react'
import { useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useDevice } from '../../hooks'

export type AdminPageHeadingProps = {
    title: React.ReactNode
    description?: React.ReactNode
    showBadge?: boolean
    showActions?: boolean
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
    canBack?: boolean
} & Omit<CardProps, 'title'>

export function AdminPageHeading({
    title,
    description,
    showBadge = false,
    badgeCount = 0,
    actions,
    showActions = true,
    classNames,
    isSticky = false,
    canBack = false,
    ...props
}: AdminPageHeadingProps) {
    const router = useRouter()
    const { isSmallView } = useDevice()

    const titleClassName = cn(
        isSmallView ? 'text-xl font-bold' : 'text-2xl font-bold',
        'text-text-default',
        classNames?.title
    )

    let titleComp = (
        <div className={titleClassName}>{title as React.ReactNode}</div>
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
                <div className={titleClassName}>{title}</div>
            </Badge>
        )
    }

    const renderTitle = () => {
        if (canBack) {
            return (
                <div
                    className={cn(
                        'flex items-center gap-4',
                        classNames?.titleWrapper
                    )}
                >
                    <Button
                        isIconOnly
                        variant="flat"
                        onPress={() => router.history.back()}
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div className={cn(classNames?.titleWrapper)}>
                        {titleComp}
                        {description && (
                            <p
                                className={cn(
                                    isSmallView ? 'text-xs' : 'text-sm',
                                    'text-text-subdued',
                                    classNames?.description
                                )}
                            >
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            )
        }
        return (
            <div className={cn(classNames?.titleWrapper)}>
                {titleComp}
                {description && (
                    <p
                        className={cn(
                            isSmallView ? 'text-xs' : 'text-sm',
                            'text-text-subdued',
                            classNames?.description
                        )}
                    >
                        {description}
                    </p>
                )}
            </div>
        )
    }
    return (
        <Card
            {...props}
            shadow={props.shadow ?? 'none'}
            className={cn(
                isSmallView
                    ? 'bg-background-muted! dark:bg-background-muted'
                    : 'bg-background! dark:bg-background-hovered/40',
                isSmallView ? 'border-none' : 'border border-border-default',
                isSticky && 'sticky top-0 z-30',
                classNames?.wrapper
            )}
        >
            <CardBody
                className={cn(
                    isSmallView ? 'px-2 py-2' : 'px-6 py-5',
                    'flex flex-row justify-between items-center',
                    classNames?.base
                )}
            >
                {renderTitle()}
                {showActions && <>{actions}</>}
            </CardBody>
        </Card>
    )
}
