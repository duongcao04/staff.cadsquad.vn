import { HTMLProps } from 'react'
import { useDevice } from '../../hooks'

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
    const { isSmallView } = useDevice()
    return (
        <div
            className={`size-full py-3 px-6 animate-in fade-in slide-in-from-bottom-2 duration-400 ${className || ''}`}
            style={{
                ...(isSmallView && { padding: '8px' }),
            }}
            {...props}
        >
            {children}
        </div>
    )
}
