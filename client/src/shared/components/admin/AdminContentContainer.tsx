import { HTMLProps } from 'react'
import { cn } from '../../../lib'
import { useDevice } from '../../hooks'
import { AdminPageHeading, AdminPageHeadingProps } from './AdminPageHeading'

// Note: HTMLProps<HTMLDivElement> is usually preferred over HTMLProps<'div'> for strict TS
type Props = HTMLProps<HTMLDivElement> & {
    children: React.ReactNode
    showHeader?: boolean
    headerProps?: AdminPageHeadingProps
    breadcrumbs?: React.ReactNode
    fixedHeader?: boolean
    classNames?: {
        wrapper?: string
        wrapperContent?: string
        base?: string
    }
}

export default function AdminContentContainer({
    children,
    style,
    className,
    classNames,
    showHeader = true,
    fixedHeader = true,
    headerProps,
    breadcrumbs,
    ...props
}: Props) {
    const { isSmallView } = useDevice()

    return (
        <div
            className={cn(
                isSmallView ? 'pb-20 pt-4 px-2' : 'pb-8 pt-4 px-3',
                classNames?.wrapper
            )}
        >
            {showHeader && Boolean(headerProps) && (
                <AdminPageHeading
                    title={headerProps?.title || ''}
                    {...headerProps}
                />
            )}
            <div
                className={cn(
                    isSmallView ? 'px-0' : 'py-3 px-6',
                    'size-full  animate-in fade-in slide-in-from-bottom-2 duration-400',
                    breadcrumbs && 'pt-0 space-y-0',
                    className,
                    classNames?.base
                )}
                {...props}
            >
                {breadcrumbs}
                <div className={cn('space-y-6', classNames?.wrapperContent)}>
                    {children}
                </div>
            </div>
        </div>
    )
}
