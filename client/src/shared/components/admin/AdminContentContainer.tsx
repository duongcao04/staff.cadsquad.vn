import { HTMLProps } from 'react'
import { useDevice } from '../../hooks'
import { AdminPageHeading, AdminPageHeadingProps } from './AdminPageHeading'
import { cn } from '../../../lib'

// Note: HTMLProps<HTMLDivElement> is usually preferred over HTMLProps<'div'> for strict TS
type Props = HTMLProps<HTMLDivElement> & {
    children: React.ReactNode
    showHeader?: boolean
    headerProps?: AdminPageHeadingProps
    breadcrumbs?: React.ReactNode
    fixedHeader?: boolean
}

export default function AdminContentContainer({
    children,
    style,
    className,
    showHeader,
    fixedHeader = true,
    headerProps,
    breadcrumbs,
    ...props
}: Props) {
    const { isSmallView } = useDevice()

    return (
        <>
            {showHeader && (
                <AdminPageHeading
                    title={headerProps?.title || ''}
                    {...headerProps}
                />
            )}
            <div
                className={cn(
                    'size-full py-3 px-6 animate-in fade-in slide-in-from-bottom-2 duration-400',
                    breadcrumbs && 'pt-0 space-y-0',
                    className
                )}
                style={{
                    ...(isSmallView && { padding: '8px' }),
                }}
                {...props}
            >
                {breadcrumbs}
                <div>{children}</div>
            </div>
        </>
    )
}
