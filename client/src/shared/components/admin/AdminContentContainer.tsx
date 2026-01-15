import { HTMLProps } from 'react'

// Note: HTMLProps<HTMLDivElement> is usually preferred over HTMLProps<'div'> for strict TS
type Props = HTMLProps<HTMLDivElement> & {
    children: React.ReactNode
}

export default function AdminContentContainer({
    children,
    style,
    className,
    ...props
}: Props) {
    return (
        <div className={`size-full py-3 px-6 ${className || ''}`} {...props}>
            {children}
        </div>
    )
}
