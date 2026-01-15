import { Link, useLocation } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { type Variants } from 'motion/react'
import React, { type SVGProps, useState } from 'react'

// --- Imports từ project của bạn ---
import { MotionAside, MotionButton, MotionDiv, MotionP } from '@/lib/motion'
import {
    ActionButton,
    IconCalendarOutline,
    IconCollapse,
    IconCollapseOutline,
} from '@/shared/components'
import {
    IconOnboard,
    IconOnboardOutline,
} from '@/shared/components/icons/sidebar-icons/IconOnboard'
import {
    IconWorkbench,
    IconWorkbenchOutline,
} from '@/shared/components/icons/sidebar-icons/IconWorkbench'
import { appStore, ESidebarStatus, toggleSidebar } from '@/shared/stores'

import TaskCalendar from './TaskCalendar'
import TaskCalendarPopover from './TaskCalendarPopover'

// --- Types ---
export type TSidebarItem = {
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
    iconFill: (props: SVGProps<SVGSVGElement>) => React.ReactElement
    title: string
    path: string
}

// --- Configuration ---
export const sidebarActions: TSidebarItem[] = [
    {
        icon: IconWorkbenchOutline,
        iconFill: IconWorkbench,
        title: 'Workbench',
        path: '/',
    },
    {
        icon: IconOnboardOutline,
        iconFill: IconOnboard,
        title: 'Project center',
        path: '/project-center', // Chỉ để root path để logic startsWith hoạt động
    },
    // Các item khác bạn có thể uncomment khi cần
]

// --- Main Component ---
export function Sidebar() {
    // Không cần dùng useLocation ở cấp Sidebar cha nếu không dùng pathname cho logic chung
    const [isHover, setHover] = useState(false)
    const sidebarStatus = useStore(appStore, (state) => state.sidebarStatus)

    const asideVariants: Variants = {
        init: { opacity: 0 },
        expand: { opacity: 1, width: '300px' },
        collapse: { opacity: 1, width: '64px' },
    }

    return (
        <MotionAside
            variants={asideVariants}
            initial={
                sidebarStatus === ESidebarStatus.EXPAND ? 'expand' : 'collapse'
            }
            animate={
                sidebarStatus === ESidebarStatus.EXPAND ? 'expand' : 'collapse'
            }
            className="min-h-[calc(100vh-56px)] bg-background border-r border-border-muted pt-3 flex flex-col justify-between"
        >
            <div id="sidebar-actions">
                <div className="my-4 pl-4">
                    <ActionButton />
                </div>
                <div className="w-full pl-4 pr-1.5">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={() => toggleSidebar()}
                    >
                        {sidebarStatus === ESidebarStatus.EXPAND && (
                            <p className="p-2 text-sm font-semibold leading-5 text-nowrap overflow-hidden">
                                Navigate
                            </p>
                        )}
                        <div className="py-2 px-2.5">
                            {isHover ? (
                                <IconCollapse
                                    width={20}
                                    height={20}
                                    strokeWidth={0}
                                />
                            ) : (
                                <IconCollapseOutline
                                    width={20}
                                    height={20}
                                    strokeWidth={0}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Render danh sách items */}
                <div className="flex flex-col gap-0.5 pr-2">
                    {sidebarActions.map((item, index) => (
                        <SidebarItem key={index} data={item} />
                    ))}
                </div>
            </div>

            {/* Footer Sidebar (Calendar) */}
            <div>
                {sidebarStatus === ESidebarStatus.EXPAND && (
                    <div className="w-full pl-4 pr-1.5 flex items-center justify-start">
                        <IconCalendarOutline />
                        <p className="p-2 text-sm font-semibold leading-5 text-nowrap overflow-hidden">
                            Calendar
                        </p>
                    </div>
                )}
                {sidebarStatus === ESidebarStatus.COLLAPSE && (
                    <TaskCalendarPopover />
                )}
                <div className="mt-1.5 px-2 size-full bg-background overflow-hidden">
                    {sidebarStatus === ESidebarStatus.EXPAND && (
                        <TaskCalendar />
                    )}
                </div>
            </div>
        </MotionAside>
    )
}

// --- Sub Component (Logic Active State nằm ở đây) ---
const SidebarItem = ({ data }: { data: TSidebarItem }) => {
    const sidebarStatus = useStore(appStore, (state) => state.sidebarStatus)

    // 1. Sử dụng useLocation để lắng nghe thay đổi URL (đảm bảo rerender 100%)
    const pathname = useLocation({
        select: (location) => location.pathname,
    })

    // 2. Logic kiểm tra Active
    // - Nếu là trang chủ ('/'): Phải khớp chính xác
    // - Nếu là trang con (vd '/project-center'): Chỉ cần bắt đầu bằng path đó (fuzzy matching)
    const isActivated =
        data.path === '/' ? pathname === '/' : pathname.startsWith(data.path)

    // --- Animation Variants ---
    const buttonVariants: Variants = {
        init: { opacity: 0 },
        animate: {
            opacity: 1,
            color: 'var(--text-subdued)',
        },
        active: {
            opacity: 1,
            color: 'var(--color-default)',
        },
        hover: { opacity: 1 },
    }

    const leftLineVariants: Variants = {
        init: {
            opacity: 0,
            background: 'hsl(0,0%,80%)',
            transition: { duration: 0.1 },
        },
        animate: {
            opacity: 1,
            background: 'var(--color-primary)',
            transition: { duration: 0.1 },
        },
        hover: {
            opacity: 1,
            background: 'hsl(0,0%,80%)',
            transition: { duration: 0.1 },
        },
    }

    const textVariants: Variants = {
        init: { color: 'var(--color-text-default)' },
        animate: { color: 'var(--color-text-default)' },
    }

    return (
        <MotionDiv
            className="size-full"
            initial="init"
            // Điều khiển animation dựa trên isActivated
            animate={isActivated ? 'animate' : 'init'}
            whileHover={!isActivated ? 'hover' : 'animate'}
        >
            <Link
                to={data.path}
                className="grid grid-cols-[16px_1fr] place-items-center"
                title={data.title}
            >
                {/* Left Indicator Line */}
                <div className="w-4 flex items-center">
                    <MotionDiv
                        variants={leftLineVariants}
                        // Nếu active thì hiện vạch màu primary
                        animate={isActivated ? 'animate' : 'init'}
                        className="ml-1.5 h-4 bg-primary w-0.75 rounded-full"
                    />
                </div>

                {/* Main Button Area */}
                <MotionButton
                    variants={buttonVariants}
                    // Nếu active thì dùng variant active, ngược lại animate (màu xám nhạt)
                    animate={isActivated ? 'active' : 'animate'}
                    className="w-full group cursor-pointer flex items-center justify-start rounded-lg hover:bg-text-disabled transition duration-200"
                >
                    <div className="py-2 px-2.5">
                        {isActivated ? (
                            <data.iconFill
                                className="text-primary"
                                width={20}
                                height={20}
                            />
                        ) : (
                            <data.icon
                                width={20}
                                height={20}
                                className="text-text-default"
                            />
                        )}
                    </div>

                    {sidebarStatus === ESidebarStatus.EXPAND && (
                        <MotionP
                            variants={textVariants}
                            className={`text-sm ${
                                isActivated ? 'font-semibold text-primary!' : ''
                            } text-nowrap overflow-hidden py-2 pr-2 pl-0.5`}
                        >
                            {data.title}
                        </MotionP>
                    )}
                </MotionButton>
            </Link>
        </MotionDiv>
    )
}
