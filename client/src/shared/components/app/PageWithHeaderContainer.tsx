import { useDevice } from '@/shared/hooks'
import React from 'react'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'

type Props = {
    header: React.ReactNode
    mobileHeader?: React.ReactNode
    children: React.ReactNode
    scrollable?: boolean // Add this prop
    showHeader?: boolean
}

export function PageWithHeaderContainer({
    header,
    children,
    mobileHeader,
    scrollable = true,
    showHeader = true,
}: Props) {
    const { isSmallView } = useDevice()

    const hasResponsive = Boolean(mobileHeader)
    const headerHeight = showHeader
        ? isSmallView && hasResponsive
            ? '44px'
            : '56px'
        : 0

    return (
        <>
            <div className="fixed top-0 w-full z-50">
                {isSmallView && hasResponsive ? mobileHeader : header}
            </div>

            {/* Height spacer for fixed header */}
            <div
                style={{
                    height: headerHeight,
                }}
            />

            <div
                style={{
                    height: `calc(100vh - ${headerHeight})`,
                    // If not scrollable, we hide overflow to let children handle it,
                    // or 'visible' if the child needs to stick out.
                    // Usually 'hidden' or 'clip' is safer for app layouts.
                    overflow: scrollable ? undefined : 'hidden',
                }}
                className="w-full"
            >
                {scrollable ? (
                    <ScrollArea className="size-full">
                        <ScrollBar orientation="horizontal" />
                        <ScrollBar orientation="vertical" />
                        {children}
                    </ScrollArea>
                ) : (
                    // Render children directly with full height
                    <div className="size-full relative">{children}</div>
                )}
            </div>
        </>
    )
}
