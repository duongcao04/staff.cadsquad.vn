import { cn, INTERNAL_URLS } from '@/lib'
import {
    Dots9,
    Ellipsis,
    SquareDashed,
    SquareFill,
    TriangleUp,
    TriangleUpFill,
} from '@gravity-ui/icons'
import { Link, useLocation } from '@tanstack/react-router'
import React, { useMemo } from 'react'

export function AdminMobileBottomNav() {
    const location = useLocation()
    const currentPath = location.pathname

    const bottomNavItems = useMemo(
        () => [
            {
                icon: Dots9,
                activeIcon: Dots9,
                label: 'Control Center',
                href: INTERNAL_URLS.admin.overview,
            },
            {
                icon: TriangleUp,
                activeIcon: TriangleUpFill,
                label: 'Jobs',
                href: INTERNAL_URLS.management.jobs,
                // Define a prefix to match sub-routes (e.g., /mgmt/jobs/create)
                matchPrefix: '/mgmt/jobs',
            },
            {
                icon: SquareDashed,
                activeIcon: SquareFill,
                label: 'Team',
                href: INTERNAL_URLS.management.team,
                matchPrefix: '/mgmt/staff-directory',
            },
            {
                icon: Ellipsis,
                activeIcon: Ellipsis,
                label: 'More',
                href: INTERNAL_URLS.admin.more,
                matchPrefix: '/administrator/more',
            },
        ],
        []
    )

    const checkIsActive = (href: string, matchPrefix?: string) => {
        // 1. Exact match for root paths
        if (href === '/') {
            return currentPath === '/'
        }

        // 2. If a specific prefix is defined, check if the current path starts with it.
        // This is useful for nested routes like /mgmt/jobs/JOB-123 highlighting the 'Jobs' tab.
        if (matchPrefix && currentPath.startsWith(matchPrefix)) {
            return true
        }

        // 3. Fallback: Exact match or starts with the exact href + '/' (to avoid matching /admin with /administrator)
        return currentPath === href || currentPath.startsWith(`${href}/`)
    }

    const activeIndex = useMemo(() => {
        const index = bottomNavItems.findIndex((it) =>
            checkIsActive(it.href, it.matchPrefix)
        )
        return index >= 0 ? index : 0
    }, [currentPath, bottomNavItems])

    return (
        <div
            className={cn(
                'fixed bottom-0 left-0 w-full bg-background px-2 flex justify-between items-center z-50 border-t border-border-muted',
                'transition-transform duration-300 ease-in-out pb-safe'
            )}
        >
            <div className="grid grid-cols-4 w-full items-center relative">
                <div
                    className="absolute top-0 left-0 h-0.75 bg-primary! rounded-b-md transition-transform duration-300 ease-in-out"
                    style={{
                        width: `${100 / bottomNavItems.length}%`,
                        transform: `translateX(${activeIndex * 100}%)`,
                    }}
                />

                {bottomNavItems.map((it) => {
                    const isActive = checkIsActive(it.href, it.matchPrefix)

                    return (
                        <NavItem
                            key={it.label}
                            href={it.href}
                            icon={it.icon}
                            activeIcon={it.activeIcon}
                            label={it.label}
                            isActive={isActive}
                        />
                    )
                })}
            </div>
        </div>
    )
}

function NavItem({
    icon: Icon,
    activeIcon: ActiveIcon,
    label,
    href,
    classNames,
    isActive,
}: {
    icon: any
    activeIcon: any
    label: React.ReactNode
    href: string
    isActive: boolean
    classNames?: {
        wrapper?: string
        icon?: string
        label?: string
    }
}) {
    return (
        <Link
            to={href}
            className={cn(
                'relative py-3 size-full flex items-center justify-center transition-colors',
                classNames?.wrapper,
                isActive ? 'text-primary!' : 'text-text-subdued'
            )}
        >
            <button className="flex flex-col items-center gap-1 cursor-pointer w-full focus:outline-none">
                <div className="flex items-center justify-center h-6">
                    {React.isValidElement(Icon) && !isActive ? (
                        Icon
                    ) : React.isValidElement(ActiveIcon) && isActive ? (
                        ActiveIcon
                    ) : isActive ? (
                        <ActiveIcon fontSize={26} strokeWidth={2} />
                    ) : (
                        <Icon fontSize={24} strokeWidth={1.5} />
                    )}
                </div>

                <p
                    className={cn(
                        'text-[10px] font-medium leading-none',
                        classNames?.label
                    )}
                >
                    {label}
                </p>
            </button>
        </Link>
    )
}
