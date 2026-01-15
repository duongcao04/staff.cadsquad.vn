'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

export function TextClamp({
    children,
    classNames,
}: {
    children: React.ReactNode
    classNames?: {
        wrapper?: string
        text?: string
        button?: string
    }
}) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className={cn(classNames?.wrapper)}>
            <span
                className={cn(
                    `${expanded ? '' : 'line-clamp-2'}`,
                    classNames?.text
                )}
            >
                {children}{' '}
            </span>

            <button
                className={cn(
                    'inline-block text-sm font-medium hover:underline cursor-pointer text-defaultp5',
                    classNames?.button
                )}
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? 'View less' : 'View more'}
            </button>
        </div>
    )
}
