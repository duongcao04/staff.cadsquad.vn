import { cn, INTERNAL_URLS, profileOptions } from '@/lib'
import {
    Briefcase,
    BriefcaseFill,
    Clock,
    ClockFill,
    House,
    HouseFill,
} from '@gravity-ui/icons'
import { Image } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from '@tanstack/react-router'
import React, { useMemo } from 'react'
import { useHideOnScroll } from '../../../hooks'

export function MobileBottomNav() {
    const { data } = useQuery(profileOptions())
    const location = useLocation()
    const currentPath = location.pathname

    const isHidden = useHideOnScroll({ threshold: 0, topOffset: 50 })

    const bottomNavItems = useMemo(
        () => [
            {
                icon: House,
                activeIcon: HouseFill,
                label: 'Home',
                href: INTERNAL_URLS.workbench,
            },
            {
                icon: Briefcase,
                activeIcon: BriefcaseFill,
                label: 'Project Center',
                href: INTERNAL_URLS.projectCenter,
            },
            {
                icon: Clock,
                activeIcon: ClockFill,
                label: 'Schedule',
                href: INTERNAL_URLS.userSchedule,
            },
            {
                icon: (
                    <Image
                        src={data?.profile.avatar}
                        classNames={{
                            wrapper:
                                'size-[22px] border rounded-full border-2 border-border-default',
                            img: 'rounded-full',
                        }}
                    />
                ),
                activeIcon: (
                    <Image
                        src={data?.profile.avatar}
                        classNames={{
                            wrapper:
                                'size-[22px] border rounded-full border-2 border-primary',
                            img: 'rounded-full',
                        }}
                    />
                ),
                label: 'Profile',
                href: INTERNAL_URLS.profile,
            },
        ],
        [data?.profile.avatar]
    )

    const checkIsActive = (href: string) => {
        if (href === '/') {
            return currentPath === '/' // Exact match for home
        }
        return currentPath.startsWith(href) // Partial match for nested routes
    }

    const activeIndex = useMemo(() => {
        const index = bottomNavItems.findIndex((it) => checkIsActive(it.href))
        return index >= 0 ? index : 0
    }, [currentPath, bottomNavItems])

    return (
        <div
            className={cn(
                'fixed bottom-0 left-0 w-full bg-background px-2 flex justify-between items-center z-50 border-t border-border-muted',
                'transition-transform duration-300 ease-in-out',
                isHidden ? 'translate-y-full' : 'translate-y-0'
            )}
        >
            <div className="grid grid-cols-4 w-full items-center relative">
                <div
                    className="absolute top-0 left-0 h-0.5 bg-primary! rounded-b-md transition-transform duration-300 ease-in-out"
                    style={{
                        width: `${100 / bottomNavItems.length}%`,
                        transform: `translateX(${activeIndex * 100}%)`,
                    }}
                />

                {bottomNavItems.map((it) => {
                    const isActive = checkIsActive(it.href)

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
                'relative py-2 size-full flex items-center justify-center transition-colors',
                classNames?.wrapper,
                isActive ? 'text-primary!' : 'text-text-subdued'
            )}
        >
            <button className="flex flex-col items-center gap-1 cursor-pointer">
                {React.isValidElement(Icon) && !isActive ? (
                    Icon
                ) : React.isValidElement(ActiveIcon) && isActive ? (
                    ActiveIcon
                ) : isActive ? (
                    <ActiveIcon fontSize={26} strokeWidth={2} />
                ) : (
                    <Icon fontSize={24} strokeWidth={1.5} />
                )}

                <p className={cn('text-[10px] font-medium', classNames?.label)}>
                    {label}
                </p>
            </button>
        </Link>
    )
}
