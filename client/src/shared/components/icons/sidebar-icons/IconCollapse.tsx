import { cn } from '@/lib'
import type { SVGProps } from 'react'

interface Props extends SVGProps<SVGSVGElement> {
    rotated?: boolean
}
export function IconCollapseOutline({ rotated, className, ...props }: Props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 20 20"
            {...props}
            className={cn(
                'transition-transform duration-300 ease-in-out',
                rotated && 'rotate-180',
                className
            )}
        >
            <path
                fill="currentColor"
                d="m6.821 10.5l.998.874a.5.5 0 0 1-.658.752l-2-1.75a.5.5 0 0 1 0-.752l2-1.75a.5.5 0 0 1 .658.752l-.998.874H10.5a.5.5 0 0 1 0 1zM18 14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2zm-2 1a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3v10zm-4 0V5H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1z"
            ></path>
        </svg>
    )
}

export function IconCollapse({ rotated, className, ...props }: Props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 20 20"
            className={cn(
                'transition-transform duration-300 ease-in-out',
                rotated && 'rotate-180',
                className
            )}
            {...props}
        >
            <path
                fill="currentColor"
                d="m6.821 10.5l.998.874a.5.5 0 0 1-.658.752l-2-1.75a.5.5 0 0 1 0-.752l2-1.75a.5.5 0 0 1 .658.752l-.998.874H10.5a.5.5 0 0 1 0 1zM18 14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2zm-6 1V5H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1z"
            ></path>
        </svg>
    )
}
