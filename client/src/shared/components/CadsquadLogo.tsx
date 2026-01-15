import { Link } from '@tanstack/react-router'
import { useTheme } from 'next-themes'
import { memo } from 'react'

import { cn } from '@/lib/utils'

import CSDLogo from '../../assets/logo.webp'
import CSDWhiteLogo from '../../assets/logo-white.webp'

type Props = {
    canRedirect?: boolean
    href?: string
    classNames?: {
        root?: string
        logo?: string
    }
    logoTheme?: 'light' | 'dark'
}

function CadsquadLogo({
    logoTheme: forceTheme,
    canRedirect = true,
    href = '/',
    classNames,
}: Props) {
    const { resolvedTheme } = useTheme()
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        const wrapperClassName = cn('block w-fit', classNames?.root)
        return canRedirect ? (
            <Link to={href} className={wrapperClassName}>
                {children}
            </Link>
        ) : (
            <div className={wrapperClassName}>{children}</div>
        )
    }

    const logoTheme = forceTheme ?? resolvedTheme

    return (
        <Wrapper>
            <img
                src={logoTheme === 'light' ? CSDLogo : CSDWhiteLogo}
                alt="CSD Logo"
                className={cn('object-contain w-fit', classNames?.logo)}
            />
        </Wrapper>
    )
}
export default memo(CadsquadLogo)
