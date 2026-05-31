import { Link } from '@tanstack/react-router'
import { useTheme } from 'next-themes'

import { cn } from '@/presentation/lib/utils'

import CSDWhiteLogo from '../../assets/logo-white.webp'
import CSDLogo from '../../assets/logo.webp'

type Props = {
    canRedirect?: boolean
    href?: string
    classNames?: {
        root?: string
        logo?: string
    }
    logoTheme?: 'light' | 'dark'
}

export function CadsquadLogo({
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
